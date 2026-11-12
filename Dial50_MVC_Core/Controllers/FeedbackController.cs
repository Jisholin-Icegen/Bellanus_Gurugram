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
    public class FeedbackController : ControllerBase
    {
        private readonly IBedService _service;

        public FeedbackController(IBedService service)
        {
            _service = service;
        }

        [HttpPost("SubmitDischargeFeedback")]
        public async Task<IActionResult> SubmitDischargeFeedback([FromBody] DischargeFeedbackRequest feedbackRequest)
        {
            try
            {
                var data = await _service.SubmitDischargeFeedback(feedbackRequest);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Result = "Error", Message = ex.Message });
            }
        }

        [HttpGet("GetActiveDepartments")]
        public async Task<IActionResult> GetActiveDepartments(string roomNo = null, string bedNo = null)
        {
            try
            {
                var data = await _service.GetActiveDepartments(roomNo, bedNo);
                return Ok(new { status = true, data = data });
            }
            catch (Exception ex)
            {
                return BadRequest(new { status = false, message = ex.Message });
            }
        }

        [HttpGet("GetFeedbackByReference")]
        public async Task<IActionResult> GetFeedbackByReference(string referenceNo)
        {
            try
            {
                var data = await _service.GetFeedbackByReference(referenceNo);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Result = "Error", Message = ex.Message });
            }
        }

        [HttpGet("GetFeedbackByBed")]
        public async Task<IActionResult> GetFeedbackByBed(string bedNo)
        {
            try
            {
                var data = await _service.GetFeedbackByBed(bedNo);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Result = "Error", Message = ex.Message });
            }
        }

        [HttpGet("GetFeedbackSummary")]
        public async Task<IActionResult> GetFeedbackSummary(DateTime? startDate = null, DateTime? endDate = null)
        {
            try
            {
                var data = await _service.GetFeedbackSummary(startDate, endDate);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Result = "Error", Message = ex.Message });
            }
        }

        [HttpGet("GetDepartmentRatings")]
        public async Task<IActionResult> GetDepartmentRatings(string? referenceNo = null, string? bedNo = null)
        {
            try
            {
                var data = await _service.GetDepartmentRatings(referenceNo, bedNo);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Result = "Error", Message = ex.Message });
            }
        }

        [HttpGet("GetUnsatisfiedDepartments")]
        public async Task<IActionResult> GetUnsatisfiedDepartments(DateTime? startDate = null, DateTime? endDate = null, string? bedNo = null)
        {
            try
            {
                var data = await _service.GetUnsatisfiedDepartments(startDate, endDate, bedNo);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Result = "Error", Message = ex.Message });
            }
        }

        [HttpGet("GetDepartmentSummary")]
        public async Task<IActionResult> GetDepartmentSummary(DateTime? startDate = null, DateTime? endDate = null, string? bedNo = null)
        {
            try
            {
                var data = await _service.GetDepartmentSummary(startDate, endDate, bedNo);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Result = "Error", Message = ex.Message });
            }
        }

        [HttpGet("GetPatientSummary")]
        public async Task<IActionResult> GetPatientSummary(DateTime? startDate = null, DateTime? endDate = null, string? bedNo = null, string? patientName = null)
        {
            try
            {
                var data = await _service.GetPatientSummary(startDate, endDate, bedNo, patientName);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Result = "Error", Message = ex.Message });
            }
        }

        [HttpGet("GetCompleteFeedback")]
        public async Task<IActionResult> GetCompleteFeedback(string? referenceNo = null, string? bedNo = null, string? patientName = null)
        {
            try
            {
                var data = await _service.GetCompleteFeedback(referenceNo, bedNo, patientName);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Result = "Error", Message = ex.Message });
            }
        }
    }
}