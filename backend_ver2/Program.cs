using System.Net.WebSockets;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseWebSockets();

List<WebSocket> clients = new();

bool IsValidJson(string str)
{
    str = str.Trim();
    return (str.StartsWith("{") && str.EndsWith("}")) ||
           (str.StartsWith("[") && str.EndsWith("]"));
}

app.Use(async (context, next) =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var ws = await context.WebSockets.AcceptWebSocketAsync();
        clients.Add(ws);
        Console.WriteLine("Client connected. Total: " + clients.Count);

        var buffer = new byte[1024 * 1024]; // 建議至少 1MB

        while (ws.State == WebSocketState.Open)
        {
            using var ms = new MemoryStream();
            WebSocketReceiveResult result;

            do
            {
                result = await ws.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                ms.Write(buffer, 0, result.Count);
            }
            while (!result.EndOfMessage);

            var messageBytes = ms.ToArray();
            var message = Encoding.UTF8.GetString(messageBytes);
            Console.WriteLine($"Received: {message}");

            if (IsValidJson(message))
            {
                // 只廣播 JSON 格式資料
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
            else
            {
                Console.WriteLine("Ignored non-JSON message: " + message);
            }
        }
    }
    else
    {
        await next();
    }
});

app.Run("http://localhost:5000");
