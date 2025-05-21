using System.Net.WebSockets;
using System.Text;
using backend_ver2.Models;
using backend_ver2.Questions;

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



Game game = new();
int artistIndex = 0;

async void setArtist(int index)
{
    // Random pick 2 questions from the QuestionBank
    var random = new Random();
    var question1 = QuestionBank.Questions[random.Next(0, QuestionBank.Questions.Count)];
    var question2 = QuestionBank.Questions[random.Next(0, QuestionBank.Questions.Count)];
    while (question1 == question2)
    {
        question2 = QuestionBank.Questions[random.Next(0, QuestionBank.Questions.Count)];
    }


    if (index >= game.Players.Count)
    {
        index = 0;
    }
    var artist = game.Players[index];
    artist.isDrawing = true;
    Console.WriteLine("Artist set: " + artist.Name);
    var notifyMessage = $"{{\"type\": \"artist\", \"artist\": \"{artist.Name}\"}}";
    foreach (var client in clients.ToList())
    {
        if (client.State == WebSocketState.Open)
        {
            await client.SendAsync(
                Encoding.UTF8.GetBytes(notifyMessage),
                WebSocketMessageType.Text,
                true,
                CancellationToken.None
            );
        }
    }

    // send question to artist
    var questionMessage = $"{{\"type\": \"question\", \"question1\": \"{question1}\", \"question2\": \"{question2}\"}}";
    foreach (var client in clients.ToList())
    {
        if (client.State == WebSocketState.Open && client.GetHashCode().ToString() == artist.ClientId)
        {
            await client.SendAsync(
                Encoding.UTF8.GetBytes(questionMessage),
                WebSocketMessageType.Text,
                true,
                CancellationToken.None
            );
        }
    }

    var playerList = new StringBuilder();
    playerList.Append("{\"type\": \"playerList\", \"players\": [");
    foreach (var player in game.Players)
    {
        playerList.Append($"{{\"name\": \"{player.Name}\", \"score\": {player.Score}, \"isDrawing\": {player.isDrawing.ToString().ToLower()}}},");
    }
    if (game.Players.Count > 0)
    {
        playerList.Remove(playerList.Length - 1, 1); // remove last comma
    }
    playerList.Append("]}");
    foreach (var client in clients.ToList())
    {
        if (client.State == WebSocketState.Open)
        {
            client.SendAsync(
                Encoding.UTF8.GetBytes(playerList.ToString()),
                WebSocketMessageType.Text,
                true,
                CancellationToken.None
            );
        }
    }
}

app.Use(async (context, next) =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var ws = await context.WebSockets.AcceptWebSocketAsync();
        clients.Add(ws);
        Console.WriteLine("Client connected. Total: " + clients.Count);

        var buffer = new byte[1024 * 1024 * 1];

        try {
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
                    var doc = System.Text.Json.JsonDocument.Parse(message);
                    var root = doc.RootElement;
                    if (root.TryGetProperty("type", out var type) && type.GetString() == "setName")
                    {
                        string name = root.GetProperty("name").GetString();
                        Console.WriteLine("Set name: " + name);
                        if (game.Players.Any(p => p.Name == name))
                        {
                            Console.WriteLine("Name already exists");
                            await ws.SendAsync(
                                Encoding.UTF8.GetBytes("{\"error\": \"Name already exists\"}"),
                                WebSocketMessageType.Text,
                                true,
                                CancellationToken.None
                            );
                            continue;
                        }
                        else
                        {
                            game.Players.Add(new Player { Name = name, Score = 0, isDrawing = false, ClientId = ws.GetHashCode().ToString() });
                            Console.WriteLine("Player added: " + name);
                            Console.WriteLine("Players: " + string.Join(", ", game.Players.Select(p => p.Name)));

                            var playerList = new StringBuilder();
                            playerList.Append("{\"type\": \"playerList\", \"players\": [");
                            foreach (var player in game.Players)
                            {
                                playerList.Append($"{{\"name\": \"{player.Name}\", \"score\": {player.Score}, \"isDrawing\": {player.isDrawing.ToString().ToLower()}}},");
                            }
                            playerList.Remove(playerList.Length - 1, 1); // remove last comma
                            playerList.Append("]}");
                            foreach (var client in clients.ToList())
                            {
                                if (client.State == WebSocketState.Open)
                                {
                                    await client.SendAsync(
                                        Encoding.UTF8.GetBytes(playerList.ToString()),
                                        WebSocketMessageType.Text,
                                        true,
                                        CancellationToken.None
                                    );
                                }
                            }

                            if (game.Players.Count >= 3) {
                                // Start the game when there are at least 3 players
                                // Send notification to all players
                                Console.WriteLine("Starting game...");
                                var notifyMessage = "{\"type\": \"bottomNotices\", \"message\": \"Game is starting!\"}";
                                foreach (var client in clients.ToList())
                                {
                                    if (client.State == WebSocketState.Open)
                                    {
                                        await client.SendAsync(
                                            Encoding.UTF8.GetBytes(notifyMessage),
                                            WebSocketMessageType.Text,
                                            true,
                                            CancellationToken.None
                                        );
                                    }
                                }
                                setArtist(artistIndex);
                            }
                        }
                    }
                    else if (root.TryGetProperty("type", out type) && type.GetString() == "selectWord")
                    {
                        string selectedWord = root.GetProperty("word").GetString();
                        game.Question = selectedWord;
                        Console.WriteLine("Selected word: " + selectedWord);
                    }
                    else if (root.TryGetProperty("type", out type) && type.GetString() == "setTime")
                    {
                        Console.WriteLine("Set time: " + root.GetProperty("time").GetInt32());
                    }

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
        finally {
            clients.Remove(ws);
            Console.WriteLine("Client disconnected. Total: " + clients.Count);
            var player = game.Players.FirstOrDefault(p => p.ClientId == ws.GetHashCode().ToString());
            if (player != null)
            {
                game.Players.Remove(player);
                Console.WriteLine("Player removed: " + player.Name);
                var playerList = new StringBuilder();
                playerList.Append("{\"type\": \"playerList\", \"players\": [");
                foreach (var p in game.Players)
                {
                    playerList.Append($"{{\"name\": \"{p.Name}\", \"score\": {p.Score}, \"isDrawing\": {p.isDrawing.ToString().ToLower()}}},");
                }
                playerList.Remove(playerList.Length - 1, 1); // remove last comma
                playerList.Append("]}");
                foreach (var client in clients.ToList())
                {
                    if (client.State == WebSocketState.Open)
                    {
                        await client.SendAsync(
                            Encoding.UTF8.GetBytes(playerList.ToString()),
                            WebSocketMessageType.Text,
                            true,
                            CancellationToken.None
                        );
                    }
                }

                //send clear canvas message to all clients
                var clearCanvasMessage = "{\"type\": \"clearCanvas\"}";
                foreach (var client in clients.ToList())
                {
                    if (client.State == WebSocketState.Open)
                    {
                        await client.SendAsync(
                            Encoding.UTF8.GetBytes(clearCanvasMessage),
                            WebSocketMessageType.Text,
                            true,
                            CancellationToken.None
                        );
                    }
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
