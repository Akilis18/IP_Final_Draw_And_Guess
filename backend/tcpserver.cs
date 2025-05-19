using System.Net.WebSockets;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseWebSockets();

List<WebSocket> clients = new();

app.Use(async (context, next) =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var ws = await context.WebSockets.AcceptWebSocketAsync();
        clients.Add(ws);
        Console.WriteLine("Client connected. Total: " + clients.Count);

        var buffer = new byte[1024 * 4];

        while (ws.State == WebSocketState.Open)
        {
            var result = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);

            if (result.MessageType == WebSocketMessageType.Close)
            {
                clients.Remove(ws);
                await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closed by client", CancellationToken.None);
                Console.WriteLine("Client disconnected. Total: " + clients.Count);
                break;
            }

            var message = Encoding.UTF8.GetString(buffer, 0, result.Count);
            Console.WriteLine($"Received: {message}");

            // Broadcast to all clients
            foreach (var client in clients.ToList())
            {
                if (client.State == WebSocketState.Open)
                {
                    await client.SendAsync(
                        Encoding.UTF8.GetBytes(message),
                        WebSocketMessageType.Text,
                        true,
                        CancellationToken.None
                    );
                }
            }
        }
    }
    else
    {
        await next();
    }
});

app.Run("http://localhost:5000");
