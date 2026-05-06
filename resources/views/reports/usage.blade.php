@extends('reports.layout')

@section('content')
    <table class="data">
        <thead>
            <tr>
                <th style="width:30%;">Laboratory</th>
                <th style="width:10%;">Capacity</th>
                <th style="width:15%;">Approved bookings</th>
                <th style="width:15%;">Total hours</th>
                <th style="width:15%;">Avg hours / booking</th>
                <th style="width:15%;">Peak start hour</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $row)
                <tr>
                    <td>{{ $row['laboratory'] }}</td>
                    <td>{{ $row['capacity'] }}</td>
                    <td>{{ $row['approved_count'] }}</td>
                    <td>{{ $row['total_hours'] }}</td>
                    <td>{{ $row['avg_hours'] }}</td>
                    <td>{{ $row['peak_hour'] }}</td>
                </tr>
            @empty
                <tr class="empty-row">
                    <td colspan="6">No approved facility reservations found for usage analytics.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
@endsection
