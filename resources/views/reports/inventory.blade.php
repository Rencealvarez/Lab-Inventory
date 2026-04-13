@extends('reports.layout')

@section('content')
    <table class="data">
        <thead>
            <tr>
                <th style="width:11%;">SKU</th>
                <th style="width:22%;">Item</th>
                <th style="width:14%;">Category</th>
                <th style="width:7%;">Qty</th>
                <th style="width:8%;">Min alert</th>
                <th style="width:24%;">Location</th>
                <th style="width:14%;">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $row)
                <tr>
                    <td>{{ $row['sku'] }}</td>
                    <td>{{ $row['name'] }}</td>
                    <td>{{ $row['category'] }}</td>
                    <td>{{ $row['quantity'] }}</td>
                    <td>{{ $row['min_alert'] }}</td>
                    <td>{{ $row['location'] }}</td>
                    <td>{{ $row['status'] }}</td>
                </tr>
            @empty
                <tr class="empty-row">
                    <td colspan="7">No inventory records on file.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
@endsection
