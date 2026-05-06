<header class="doc-header">
    <div class="doc-header-inner">
        <div class="doc-brand">
            @if (extension_loaded('gd'))
                <img class="logo-mark" src="{{ public_path('pculogo.png') }}" alt="Philippine Christian University Dasmariñas logo">
            @else
                <span class="logo-mark logo-fallback">PCU</span>
            @endif
            <div class="logo-text">
                <div class="system-name">Philippine Christian University Dasmariñas</div>
                <div class="subtitle">Laboratory Inventory Management</div>
            </div>
        </div>
        <div class="doc-meta">
            <h1 class="doc-title">{{ $documentTitle }}</h1>
            <p class="generated">Generated: {{ $generatedAt }}</p>
        </div>
    </div>
</header>
