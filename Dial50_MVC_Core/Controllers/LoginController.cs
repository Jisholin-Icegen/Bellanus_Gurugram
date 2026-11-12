using Microsoft.Extensions.Caching.Memory;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Repositories;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Dial50_MVC_Core.Controllers
{
    public class LoginController : Controller
    {
        private readonly IBedService _bedService;
        private readonly IPatientRepository _patientRepository;
        private readonly LandingProtector _protector;
        private readonly IMemoryCache _cache;

        public LoginController(
            IBedService bedService,
            IPatientRepository patientRepository,
            LandingProtector protector,
            IMemoryCache cache)
        {
            _bedService = bedService;
            _patientRepository = patientRepository;
            _protector = protector;
            _cache = cache;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Index(string roomNumber)
        {
            roomNumber = roomNumber?.Trim();

            if (string.IsNullOrWhiteSpace(roomNumber))
            {
                ViewData["Error"] = "Please enter a room number.";
                return View();
            }

            if (!Regex.IsMatch(roomNumber, @"^[A-Za-z0-9\- ]{1,20}$"))
            {
                ViewData["Error"] = "Please enter a valid room number.";
                ViewData["RoomNumber"] = roomNumber;
                return View();
            }

            var patient = await _bedService.LoginByRoomNoAsync(roomNumber);

            if (patient == null || patient.PatientId == 0 || patient.BedId == null)
            {
                ViewData["Error"] = "Room not found. Please check your details.";
                ViewData["RoomNumber"] = roomNumber;
                return View();
            }

            var patientDetails = await _patientRepository.GetPatientBedDetailsByBedIdAsync(patient.BedId.ToString());

            if (patientDetails == null || string.IsNullOrEmpty(patientDetails.PatientName))
            {
                ViewData["Error"] = "Patient details not found.";
                ViewData["RoomNumber"] = roomNumber;
                return View();
            }

            string bedNumber = patientDetails.RoomBed ?? (patient.ROOM + " " + patient.BED);

            string encryptedBedInfo = _protector.EncryptAES(
                patientDetails.BedId + "$$" + patientDetails.BedId + "$$" + bedNumber + "$$"
                + patientDetails.PatientName + "$$" + "IHH Healthcare");

            var newToken = Guid.NewGuid().ToString();
            _cache.Set("ActiveSession_" + patientDetails.BedId.ToString(), newToken, TimeSpan.FromHours(12));

            string redirectUrl = $"/?BedInfo={Uri.EscapeDataString(encryptedBedInfo)}";

            return Redirect(redirectUrl);
        }
    }
}