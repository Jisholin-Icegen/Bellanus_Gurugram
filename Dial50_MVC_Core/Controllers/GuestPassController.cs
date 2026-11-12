using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Mvc;
using QRCoder;

namespace Dial50_MVC_Core.Controllers
{
    public class GuestPassController : Controller
    {
        private readonly IBedService _bedService;

        public GuestPassController(IBedService bedService)
        {
            _bedService = bedService;
        }

        [HttpGet]
        public async Task<IActionResult> Qr(int id)
        {
            var pass = await _bedService.GetGuestPassByIdAsync(id);
            if (pass == null) return NotFound();

            string verifyUrl = Url.Action("Verify", "GuestPass",
                new { token = pass.QrToken }, Request.Scheme)!;

            using var gen = new QRCodeGenerator();
            using var data = gen.CreateQrCode(verifyUrl, QRCodeGenerator.ECCLevel.Q);
            using var png = new PngByteQRCode(data);

            return File(png.GetGraphic(10), "image/png");
        }

        [HttpGet]
        public async Task<IActionResult> View(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return View("VisitorPass", VisitorPassViewModel.Invalid());

            var pass = await _bedService.GetGuestPassByQrTokenAsync(token);
            if (pass == null)
                return View("VisitorPass", VisitorPassViewModel.Invalid());

            string status = await _bedService.GetGuestPassVerificationStatusAsync(token);

            var vm = new VisitorPassViewModel
            {
                GuestPassId = pass.GuestPassId,
                GuestName = pass.GuestName,
                GuestPhone = pass.GuestPhone,
                AdditionalMembers = pass.AdditionalMembers,
                PatientName = pass.PatientName,
                RoomBed = pass.RoomBed,
                PassCode = pass.PassCode,
                ValidFrom = pass.ValidFrom,
                ValidUntil = pass.ValidUntil,
                RequestTime = pass.RequestTime,
                QrImageUrl = Url.Action("Qr", "GuestPass", new { id = pass.GuestPassId }),
                Status = status
            };

            return View("VisitorPass", vm);
        }

        [HttpGet]
        public async Task<IActionResult> Verify(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return View("VerificationResult", VerificationViewModel.Invalid());

            var pass = await _bedService.GetGuestPassByQrTokenAsync(token);
            if (pass == null)
                return View("VerificationResult", VerificationViewModel.Invalid());

            string status = await _bedService.GetGuestPassVerificationStatusAsync(token);

            var vm = new VerificationViewModel
            {
                GuestName = pass.GuestName,
                GuestPhone = pass.GuestPhone,
                AdditionalMembers = pass.AdditionalMembers,
                PatientName = pass.PatientName,
                RoomBed = pass.RoomBed,
                PassCode = pass.PassCode,
                ValidFrom = pass.ValidFrom,
                ValidUntil = pass.ValidUntil,
                RequestTime = pass.RequestTime,
                Status = status,
                CanAdmit = status == "VALID",
                Token = token,
                Decision = "PENDING"
            };

            return View("VerificationResult", vm);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Allow(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return RedirectToAction("Verify", new { token });

            var pass = await _bedService.GetGuestPassByQrTokenAsync(token);
            if (pass == null)
                return RedirectToAction("Verify", new { token });

            await _bedService.UpdateGuestPassDecisionAsync(pass.GuestPassId, "ACCEPT");

            return RedirectToAction("Result", new { token, decision = "ALLOWED" });
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Deny(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return RedirectToAction("Verify", new { token });

            var pass = await _bedService.GetGuestPassByQrTokenAsync(token);
            if (pass == null)
                return RedirectToAction("Verify", new { token });

            await _bedService.UpdateGuestPassDecisionAsync(pass.GuestPassId, "DENIED");

            return RedirectToAction("Result", new { token, decision = "DENIED" });
        }

        [HttpGet]
        public async Task<IActionResult> Result(string token, string decision)
        {
            if (string.IsNullOrWhiteSpace(token))
                return View("VerificationResult", VerificationViewModel.Invalid());

            var pass = await _bedService.GetGuestPassByQrTokenAsync(token);
            if (pass == null)
                return View("VerificationResult", VerificationViewModel.Invalid());

            string status = await _bedService.GetGuestPassVerificationStatusAsync(token);

            var vm = new VerificationViewModel
            {
                GuestName = pass.GuestName,
                GuestPhone = pass.GuestPhone,
                AdditionalMembers = pass.AdditionalMembers,
                PatientName = pass.PatientName,
                RoomBed = pass.RoomBed,
                PassCode = pass.PassCode,
                ValidFrom = pass.ValidFrom,
                ValidUntil = pass.ValidUntil,
                RequestTime = pass.RequestTime,
                Status = status,
                CanAdmit = false,
                Token = token,
                Decision = decision ?? "PENDING"
            };

            return View("VerificationResult", vm);
        }
    }
}