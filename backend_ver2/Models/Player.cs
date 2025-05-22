// 放在最上面
namespace backend_ver2.Models;

class Player
{
    public string Name { get; set; }
    public int Score { get; set; }
    public bool isDrawing { get; set; }
    public string ClientId { get; set; }
    public bool isGuessed {get; set;}
}

class Game
{
    public List<Player> Players { get; set; } = new();
    public string Word { get; set; }
    public int Time { get; set; }
    public int Round { get; set; }
    public string Question { get; set; }

    public List<string> guessList {get; set;} = new();
}

