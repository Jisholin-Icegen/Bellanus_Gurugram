
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
    }
}
