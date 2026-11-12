
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Repositories;
using Dial50_MVC_Core.Services;
public class TaskTypeService : ITaskTypeService
{
    private readonly ITypeRepository _repository;

    public TaskTypeService(ITypeRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<TaskTypes>> GetTaskTypes(string? DeptID)
    {
        var data = await _repository.getDeptTaskTypes(DeptID);

        // Example business rule
        //foreach (var item in data)
        //{
        //    if (string.IsNullOrEmpty(item.Result))
        //        item.Result = "Pending";
        //}

        return data;
    }
}