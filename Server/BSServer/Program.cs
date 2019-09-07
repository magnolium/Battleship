using System.IO;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using SignalR.Server.Hubs;

namespace SignalR.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }

        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
                .UseKestrel(

                options =>
                {
                    options.ListenLocalhost(5000);
                    options.ListenAnyIP(5000);
                    //// Hub bound to TCP end point
                    //options.Listen(System.Net.IPAddress.Any, 5001, builder =>
                    //{
                    //    builder.UseHub<BattleHub>();
                    //});
                    options.AddServerHeader = false;
                })
                .UseIISIntegration()
                .UseContentRoot(Directory.GetCurrentDirectory())
                //.UseUrls("http://0.0.0.0:5000/")
                .UseStartup<Startup>();
    }
}
