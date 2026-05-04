<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChatController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        $currentUser = $request->user();
        $onlineThreshold = now()->subMinutes(5)->timestamp;

        $onlineUserIds = DB::table('sessions')
            ->whereNotNull('user_id')
            ->where('last_activity', '>=', $onlineThreshold)
            ->pluck('user_id')
            ->map(fn ($id) => (int) $id)
            ->all();
        $onlineUserIdSet = array_fill_keys($onlineUserIds, true);

        $users = User::query()
            ->whereKeyNot($currentUser->id)
            ->orderByRaw('COALESCE(name, username, email)')
            ->get(['id', 'name', 'username', 'email', 'role'])
            ->map(fn (User $user) => [
                'id' => (string) $user->id,
                'role' => strtoupper((string) ($user->role ?? 'staff')),
                'displayName' => $user->name ?? $user->username ?? $user->email ?? "User #{$user->id}",
                'isOnline' => isset($onlineUserIdSet[(int) $user->id]),
            ])
            ->values();

        return response()->json([
            'users' => $users,
        ]);
    }

    public function conversation(Request $request, User $user): JsonResponse
    {
        $currentUser = $request->user();
        $afterId = (int) $request->integer('after_id', 0);

        $sentMessages = DB::table('messages')
            ->select(['id', 'user_id', 'recipient_id', 'content', 'type', 'created_at'])
            ->where('user_id', $currentUser->id)
            ->where('recipient_id', $user->id);

        $receivedMessages = DB::table('messages')
            ->select(['id', 'user_id', 'recipient_id', 'content', 'type', 'created_at'])
            ->where('user_id', $user->id)
            ->where('recipient_id', $currentUser->id);

        $query = DB::query()
            ->fromSub($sentMessages->unionAll($receivedMessages), 'conversation_messages');

        if ($afterId > 0) {
            $messages = $query
                ->where('id', '>', $afterId)
                ->orderBy('id')
                ->get();
        } else {
            // First load: fetch most recent messages, then return in ascending order.
            $messages = $query
                ->orderByDesc('id')
                ->limit(100)
                ->get()
                ->reverse()
                ->values();
        }

        return response()->json([
            'messages' => $messages,
        ]);
    }

    public function send(Request $request): JsonResponse
    {
        $currentUser = $request->user();
        $validated = $request->validate([
            'recipient_id' => ['required', 'integer', 'exists:users,id', 'different:'.(string) $currentUser->id],
            'content' => ['required', 'string', 'max:1000'],
        ]);

        $createdAt = now();
        $messageId = DB::table('messages')->insertGetId([
            'user_id' => $currentUser->id,
            'recipient_id' => (int) $validated['recipient_id'],
            'content' => $validated['content'],
            'type' => strtolower((string) ($currentUser->role ?? 'staff')) === 'admin' ? 'admin' : 'staff',
            'created_at' => $createdAt,
            'updated_at' => $createdAt,
        ]);

        return response()->json([
            'ok' => true,
            'message' => [
                'id' => (int) $messageId,
                'user_id' => (int) $currentUser->id,
                'recipient_id' => (int) $validated['recipient_id'],
                'content' => $validated['content'],
                'type' => strtolower((string) ($currentUser->role ?? 'staff')) === 'admin' ? 'admin' : 'staff',
                'created_at' => $createdAt->toISOString(),
            ],
        ]);
    }

    public function summaries(Request $request): JsonResponse
    {
        $currentUser = (int) $request->user()->id;

        $conversationMessages = DB::table('messages')
            ->selectRaw('id, user_id, CASE WHEN user_id = ? THEN recipient_id ELSE user_id END as counterpart_id', [$currentUser])
            ->where(function ($query) use ($currentUser) {
                $query->where('user_id', $currentUser)
                    ->orWhere('recipient_id', $currentUser);
            });

        $latestByCounterpart = DB::query()
            ->fromSub($conversationMessages, 'cm')
            ->selectRaw('DISTINCT ON (counterpart_id) counterpart_id, id as latest_message_id, user_id as latest_sender_id')
            ->orderBy('counterpart_id')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'summaries' => $latestByCounterpart->map(fn ($row) => [
                'counterpartId' => (string) $row->counterpart_id,
                'latestMessageId' => (int) $row->latest_message_id,
                'latestSenderId' => (int) $row->latest_sender_id,
            ])->values(),
        ]);
    }
}
