using Dial50_MVC_Core.Data;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Repositories;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace Dial50_MVC_Core.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaskController : ControllerBase
    {

        private readonly IBedService _service;
        public TaskController(IBedService service)
        {
            _service = service;
        }

        [HttpPost("InsertTask")]
        public async Task<IActionResult> InsertTask([FromBody] TaskRequest _taskRequest)
        {
            try
            {
                var data = await _service.InsertTask(_taskRequest, string.Empty);

                return Ok(data);

                //return Json(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Result = "Error", Message = ex.Message });
            }
        }

        [HttpGet("GetTasks")]
        public async Task<IActionResult> GetTasks([FromBody] BedReqInfo bedReqInfo)
        {
            try
            {
                var data = await _service.GetBedTasks(bedReqInfo.BedID, bedReqInfo.BedNumber, string.Empty);


                return Ok(data);
                //return Json(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Result = "Error", Message = ex.Message });
            }
        }


        //[HttpPost("GetTrackInfo")]
        //public async Task<IActionResult> GetTrackInfo([FromBody] TrackReqInfo trackReqInfo)
        //{
        //    try
        //    {
        //        var data = await _service.GetTrackInfo(trackReqInfo);


        //        return Ok(data);
        //        //return Json(data);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(new { Result = "Error", Message = ex.Message });
        //    }
        //}

        [HttpPost("GetTrackInfo")]
        public async Task<IActionResult> GetTrackInfo(
            [FromBody] TrackingRequestRequest request)
        {
            var result = await _service.GetTrackingRequest(request.RoomNo, request.RequestId);
            return Ok(result);
        }

        [HttpPost("GetTrackInfoByOrderIds")]
        public async Task<IActionResult> GetTrackInfoByOrderIds(
            [FromBody] TrackingRequestByOrderIds request)
        {
            var result = await _service.GetTrackingRequestByOrderIds(request.OrderIds);

            return Ok(result);
        }

        [HttpPost("SubmitFeedback")]
        public async Task<IActionResult> SubmitFeedback([FromBody] TaskFBReq taskFBReq)
        {
            try
            {
                var data = await _service.SubmitFeedback(taskFBReq);


                return Ok(data);
                //return Json(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Result = "Error", Message = ex.Message });
            }
        }
    }
}
