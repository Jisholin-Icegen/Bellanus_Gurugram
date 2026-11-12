using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;

namespace Dial50_MVC_Core.Repositories
{
    public interface ITypeRepository
    {

        Task<List<TaskTypes>> getDeptTaskTypes(string? DeptID);
    }

}
