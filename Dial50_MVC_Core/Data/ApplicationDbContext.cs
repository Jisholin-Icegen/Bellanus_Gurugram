
using Microsoft.EntityFrameworkCore;
using Dial50_MVC_Core.Models;
using System.Collections.Generic;
namespace Dial50_MVC_Core.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<BedInfo> BedInfos { get; set; }

        public DbSet<TaskTypes> TaskTypeInfo { get; set; }


        public DbSet<TaskRequests> TaskRequests{ get; set; }


        public DbSet<TaskResponse> TaskResponse { get; set; }


        public DbSet<TrackResponseInfo> TrackInfo { get; set; }

        public DbSet<TaskFBResponse> FeedBckInfo { get; set; }

        public DbSet<ConversationQR> ConversationInfo { get; set; }

    }
}
