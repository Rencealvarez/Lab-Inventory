<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $documentTitle }} — Philippine Christian University Dasmariñas</title>
    @include('reports.partials.styles')
</head>
<body>
    @include('reports.partials.header')
    <main class="report-body">
        @yield('content')
    </main>
    @include('reports.partials.footer')
</body>
</html>
