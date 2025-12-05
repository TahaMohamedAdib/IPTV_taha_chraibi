# Simple HTTP Server for Static Website
$port = 50000
$url = "http://localhost:$port/"

Write-Host "Starting web server on $url" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()

Write-Host "Server is running! Open your browser and navigate to:" -ForegroundColor Cyan
Write-Host $url -ForegroundColor White
Write-Host ""

# Get the current directory
$rootPath = $PSScriptRoot

try {
    while ($listener.IsListening) {
        # Wait for a request
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Get the requested file path
        $requestedPath = $request.Url.LocalPath
        if ($requestedPath -eq '/') {
            $requestedPath = '/index.html'
        }
        
        $filePath = Join-Path $rootPath $requestedPath.TrimStart('/')
        
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - $($request.HttpMethod) $requestedPath" -ForegroundColor Gray
        
        if (Test-Path $filePath -PathType Leaf) {
            # File exists, serve it
            $content = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $content.Length
            
            # Set content type based on file extension
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            switch ($extension) {
                '.html' { $response.ContentType = 'text/html' }
                '.css'  { $response.ContentType = 'text/css' }
                '.js'   { $response.ContentType = 'application/javascript' }
                '.json' { $response.ContentType = 'application/json' }
                '.png'  { $response.ContentType = 'image/png' }
                '.jpg'  { $response.ContentType = 'image/jpeg' }
                '.jpeg' { $response.ContentType = 'image/jpeg' }
                '.gif'  { $response.ContentType = 'image/gif' }
                '.svg'  { $response.ContentType = 'image/svg+xml' }
                '.ico'  { $response.ContentType = 'image/x-icon' }
                '.woff' { $response.ContentType = 'font/woff' }
                '.woff2' { $response.ContentType = 'font/woff2' }
                '.ttf'  { $response.ContentType = 'font/ttf' }
                default { $response.ContentType = 'application/octet-stream' }
            }
            
            $response.StatusCode = 200
            $response.OutputStream.Write($content, 0, $content.Length)
        } else {
            # File not found
            $response.StatusCode = 404
            $notFoundMessage = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found: $requestedPath")
            $response.ContentLength64 = $notFoundMessage.Length
            $response.OutputStream.Write($notFoundMessage, 0, $notFoundMessage.Length)
            Write-Host "  -> 404 Not Found" -ForegroundColor Red
        }
        
        $response.Close()
    }
} finally {
    $listener.Stop()
    Write-Host "`nServer stopped." -ForegroundColor Yellow
}
