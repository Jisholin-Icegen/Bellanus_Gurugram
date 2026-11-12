using Dial50_MVC_Core.Data;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Models.HIS;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dial50_MVC_Core.Controllers
{
    public class PreLandingController : Controller
    {
        private readonly IBedService _service;
        private readonly IPatientRepository _patientRepository;
        private readonly LandingProtector _protector;
        private readonly HospitalSettings _hospital;
        private readonly IWebHostEnvironment _env;

        public PreLandingController(IBedService service,
                                    IPatientRepository patientRepository,
                                    LandingProtector protector,
                                    IOptions<HospitalSettings> hospitalOptions,
                                    IWebHostEnvironment env)
        {
            _service = service;
            _patientRepository = patientRepository;
            _protector = protector;
            _hospital = hospitalOptions.Value;
            _env = env;
        }

        public async Task<IActionResult> Index(string? BedInfo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(BedInfo))
                    return RenderInvalid();

                string bedInfoActual = BedInfo;
                bool wasEncrypted = false;

                try
                {
                    var decrypted = _protector.DecryptAES(BedInfo);
                    if (!string.IsNullOrWhiteSpace(decrypted))
                    {
                        bedInfoActual = decrypted;
                        wasEncrypted = true;
                    }
                }
                catch
                {
                }

                string _BedIDdial50;
                string _bedIDHIS;
                string _bedHIS;

                if (wasEncrypted && bedInfoActual.Contains("$$"))
                {
                    var parts = bedInfoActual.Split("$$", StringSplitOptions.None);
                    _BedIDdial50 = parts.Length > 0 ? parts[0] : "";
                    _bedIDHIS = parts.Length > 1 ? parts[1] : "";
                    _bedHIS = parts.Length > 2 ? parts[2] : "";
                }
                else
                {
                    _BedIDdial50 = bedInfoActual;
                    _bedIDHIS = "";
                    _bedHIS = "";
                }

                if (string.IsNullOrWhiteSpace(_BedIDdial50) && string.IsNullOrWhiteSpace(_bedIDHIS))
                    return RenderInvalid();

                string resolvedBedId = !string.IsNullOrWhiteSpace(_BedIDdial50)
                    ? _BedIDdial50
                    : _bedIDHIS;

                PatientBedDetails? patient;
                try
                {
                    patient = await _patientRepository.GetPatientBedDetailsByBedIdAsync(resolvedBedId);
                }
                catch
                {
                    return RenderInvalid();
                }

                if (patient == null || string.IsNullOrEmpty(patient.PatientName))
                    return RenderInvalid();

                if (string.IsNullOrWhiteSpace(patient.BedId))
                    return RenderInvalid();

                string bedNumber = patient.RoomBed ?? _bedHIS ?? "";

                string bedInfoForHome = _protector.EncryptAES(
                    patient.BedId + "$$" + patient.BedId + "$$" + bedNumber + "$$"
                    + patient.PatientName + "$$" + _hospital.Name);

                ViewBag.IsInvalid = false;
                ViewBag.bedInfoEncrypt = Uri.EscapeDataString(bedInfoForHome);
                ViewBag.BedId = patient.BedId;

                ViewBag.Region = "IN";
                ViewBag.HospitalName = _hospital.Name;
                ViewBag.HospitalLogo = _hospital.LogoPath;

                var model = new List<BedInfo>
                {
                    new BedInfo
                    {
                        BedID        = patient.BedId,
                        BedIDHIS     = patient.BedId,
                        BedNumber    = bedNumber,
                        PatientName  = patient.PatientName,
                        HospitalName = _hospital.Name
                    }
                };

                return View("Index", model);
            }
            catch
            {
                return RenderInvalid();
            }
        }

        private IActionResult RenderInvalid()
        {
            ViewData["Title"] = "Invalid QR Code - " + _hospital.Name;
            ViewBag.IsInvalid = true;
            ViewBag.bedInfoEncrypt = "";
            ViewBag.BedId = "";
            ViewBag.Region = "IN";
            ViewBag.HospitalName = _hospital.Name;
            ViewBag.HospitalLogo = _hospital.LogoPath;
            return View("Index", new List<BedInfo>());
        }

        public IActionResult Invalid() => RenderInvalid();

        public IActionResult Logout(string? BedInfo)
        {
            ViewData["Title"] = "Session Ended - " + _hospital.Name;
            ViewBag.HospitalName = _hospital.Name;
            ViewBag.HospitalLogo = _hospital.LogoPath;
            ViewBag.IsInvalid = false;
            ViewBag.BedId = "";
            ViewBag.Region = "IN";

            var model = new List<BedInfo>();

            if (!string.IsNullOrWhiteSpace(BedInfo))
            {
                var decrypted = _protector.DecryptAES(BedInfo);

                if (!string.IsNullOrWhiteSpace(decrypted))
                {
                    if (decrypted.Contains("$$"))
                    {
                        var parts = decrypted.Split("$$", StringSplitOptions.None);
                        string bedId = parts.Length > 1 && !string.IsNullOrWhiteSpace(parts[1]) ? parts[1] : parts[0];
                        string bedNumber = parts.Length > 2 ? parts[2] : "";
                        string patientName = parts.Length > 3 ? parts[3] : "";

                        model.Add(new BedInfo
                        {
                            BedID = bedId,
                            BedIDHIS = bedId,
                            BedNumber = bedNumber,
                            PatientName = patientName,
                            HospitalName = _hospital.Name
                        });
                    }
                    else
                    {
                        model.Add(new BedInfo
                        {
                            BedID = decrypted,
                            BedIDHIS = decrypted,
                            BedNumber = "",
                            PatientName = "",
                            HospitalName = _hospital.Name
                        });
                    }
                }
                else
                {
                    model.Add(new BedInfo
                    {
                        BedID = BedInfo,
                        BedIDHIS = BedInfo,
                        BedNumber = "",
                        PatientName = "",
                        HospitalName = _hospital.Name
                    });
                }
            }

            return View("Logout", model);
        }
    }
}