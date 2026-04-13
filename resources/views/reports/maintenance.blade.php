@extends('reports.layout')

@section('content')
    <table class="data">
        <thead>
            <tr>
                <th style="width:10%;">Reference</th>
                <th style="width:9%;">Date</th>
                <th style="width:22%;">Item</th>
                <th style="width:14%;">Laboratory</th>
                <th style="width:9%;">Severity</th>
                <th style="width:11%;">Status</th>
                <th style="width:11%;">Action</th>
                <th style="width:8%;">Cost</th>
                <th style="width:16%;">Reported by</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $row)
                <tr>
                    <td>{{ $row['ref'] }}</td>
                    <td>{{ $row['occurred'] }}</td>
                    <td>{{ $row['item'] }}</td>
                    <td>{{ $row['laboratory'] }}</td>
                    <td>{{ $row['severity'] }}</td>
                    <td>{{ $row['status'] }}</td>
                    <td>{{ $row['action'] }}</td>
                    <td>{{ $row['cost'] }}</td>
                    <td>{{ $row['reporter'] }}</td>
                </tr>
            @empty
                <tr class="empty-row">
                    <td colspan="9">No maintenance or incident records.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
@endsection
