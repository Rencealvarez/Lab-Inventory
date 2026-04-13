@extends('reports.layout')

@section('content')
    <table class="data">
        <thead>
            <tr>
                <th style="width:14%;">Date &amp; time</th>
                <th style="width:11%;">Type</th>
                <th style="width:24%;">Item</th>
                <th style="width:16%;">User</th>
                <th style="width:6%;">Qty</th>
                <th style="width:11%;">Status</th>
                <th style="width:18%;">Remarks</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $row)
                <tr>
                    <td>{{ $row['date'] }}</td>
                    <td>{{ $row['type'] }}</td>
                    <td>{{ $row['item'] }}</td>
                    <td>{{ $row['user'] }}</td>
                    <td>{{ $row['quantity'] }}</td>
                    <td>{{ $row['status'] }}</td>
                    <td>{{ $row['remarks'] }}</td>
                </tr>
            @empty
                <tr class="empty-row">
                    <td colspan="7">No transactions recorded.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
@endsection
