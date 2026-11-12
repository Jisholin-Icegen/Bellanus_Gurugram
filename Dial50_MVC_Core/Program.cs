using Dial50_MVC_Core.Data;
using Dial50_MVC_Core.Models;
using Dial50_MVC_Core.Repositories;
using Dial50_MVC_Core.Services;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

var keysFolder = Path.Combine(builder.Environment.ContentRootPath, "DataProtectionKeys");

builder.Services.AddControllersWithViews();
builder.Services.AddAuthentication();
builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<PushStore>();
builder.Services.AddSingleton<PushSender>();
builder.Services.AddHostedService<NotificationPushWorker>();
builder.Services.Configure<HospitalSettings>(builder.Configuration.GetSection("HospitalSettings"));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Dial50")));


builder.Services.AddMemoryCache();
builder.Services.AddHttpClient();

builder.Services.AddScoped<IBedRepository, BedRepository>();
builder.Services.AddScoped<IBedService, BedService>();
builder.Services.AddScoped<ILogService, LogService>();
builder.Services.AddScoped<IPatientRepository, PatientRepository>();
builder.Services.AddHttpClient<IPatientRepository, PatientRepository>();
builder.Services.AddScoped<ITypeRepository, TypeRepository>();
builder.Services.AddScoped<IFoodRepository, FoodRepository>();
builder.Services.AddScoped<IFoodService, FoodService>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddHttpClient<IGuestApiService, GuestApiService>();
builder.Services.AddScoped<ISmsService, LogSmsService>();
builder.Services.AddHttpClient<ISmsService, TextBeeSmsService>();

builder.Services.Configure<EncryptionSettings>(builder.Configuration.GetSection("EncryptionSettings"));
builder.Services.Configure<DepartmentSettings>(builder.Configuration.GetSection("Departments"));
builder.Services.Configure<HospitalSettings>(builder.Configuration.GetSection("HospitalSettings"));
builder.Services.AddScoped<LandingProtector>();
builder.Services.Configure<LoocAISettings>(builder.Configuration.GetSection("LoocAI"));
builder.Services.AddScoped<LandingProtector>();
builder.Services.AddScoped<IBedContextAccessor, BedContextAccessor>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddControllersWithViews(o => o.Filters.Add<BedContextFilter>());

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(60);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.Name = ".Dial50.Session";
});

var languageSettings = builder.Configuration.GetSection("SupportedLanguages").Get<List<LanguageSetting>>();
var supportedCultures = languageSettings.Select(l => new CultureInfo(l.Culture)).ToArray();

builder.Services.Configure<RequestLocalizationOptions>(options =>
{
    options.DefaultRequestCulture = new RequestCulture("en-IN");
    options.SupportedCultures = supportedCultures;
    options.SupportedUICultures = supportedCultures;
    options.RequestCultureProviders.Insert(0, new CookieRequestCultureProvider());
});

var app = builder.Build();

app.UseDeveloperExceptionPage();

app.UseHttpsRedirection();
//app.UseStaticFiles();

app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        if (ctx.File.Name.Equals("sw.js", StringComparison.OrdinalIgnoreCase))
        {
            ctx.Context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
            ctx.Context.Response.Headers["Service-Worker-Allowed"] = "/";
        }
    }
});

app.UseRequestLocalization(app.Services.GetRequiredService<IOptions<RequestLocalizationOptions>>().Value);

app.UseRouting();
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

app.Use(async (context, next) =>
{
    var path = (context.Request.Path.Value ?? "").TrimEnd('/').ToLowerInvariant();
    var hasBedInfo = context.Request.Query.ContainsKey("BedInfo")
                     && !string.IsNullOrWhiteSpace(context.Request.Query["BedInfo"]);

    if ((path == "/home" || path == "/home/index") && !hasBedInfo)
    {
        context.Response.Redirect("/PreLanding");
        return;
    }

    await next();
});

app.MapControllers();
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();