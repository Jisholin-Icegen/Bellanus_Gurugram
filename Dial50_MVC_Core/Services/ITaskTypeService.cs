using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using System.Threading.Tasks;

namespace Dial50_MVC_Core.Services
{
    public interface ITaskTypeService
    {
        Task<List<TaskTypes>> GetTaskTypes(string? DeptID);
    }
}
