using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace SignalR.Server.Hubs
{
    public class BattleHub : Hub
    {
        private static int accum = 0;

        public string PlayerSetup(string player)
        {
            return $"Player {player} is now setup";
        }

        public void SendX(string userid, string mth)
        {
        }

        public static class UserHandler
        {
            public static HashSet<string> ConnectedIds = new HashSet<string>();
        }

        public override Task OnConnectedAsync()
        {
            UserHandler.ConnectedIds.Add(Context.ConnectionId);

            //foreach (string str in UserHandler.ConnectedIds)
            //Clients.All.SendAsync("send", Context.ConnectionId);

            foreach (string str in UserHandler.ConnectedIds)
                Clients.Client(str).SendAsync("send", str);

            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception exception)
        {
            UserHandler.ConnectedIds.Remove(Context.ConnectionId);
            return base.OnDisconnectedAsync(exception);
        }
    }
}
