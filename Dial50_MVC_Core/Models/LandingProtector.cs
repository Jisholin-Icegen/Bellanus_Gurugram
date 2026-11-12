using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace Dial50_MVC_Core.Models
{
    public class LandingProtector
    {
        private readonly IDataProtector _protector;
        private readonly string _key;
        public LandingProtector(IDataProtectionProvider provider, IOptions<EncryptionSettings> options)
        {
            _protector = provider.CreateProtector("QueryStringEncryption");
            _key = options.Value.Key;
        }

        public string Encrypt(string input)
        {
            return _protector.Protect(input);
        }

        public string Decrypt(string encrypted)
        {
            return _protector.Unprotect(encrypted);
        }


        public string UrlDecode(string encrypted)
        {
            return WebUtility.UrlDecode(encrypted);
        }


        public string EncryptAES(string plainText)
        {
            using var aes = Aes.Create();

            aes.Key = Encoding.UTF8.GetBytes(_key.Substring(0, 32));
            aes.IV = new byte[16]; // fixed IV for permanent token

            var encryptor = aes.CreateEncryptor();
            var bytes = Encoding.UTF8.GetBytes(plainText);
            var encrypted = encryptor.TransformFinalBlock(bytes, 0, bytes.Length);

            return Convert.ToBase64String(encrypted);
        }

        public string DecryptAES(string cipherText)
        {
            try
            {
                using var aes = Aes.Create();

                aes.Key = Encoding.UTF8.GetBytes(_key.Substring(0, 32));
                aes.IV = new byte[16];

                var decryptor = aes.CreateDecryptor();
                var bytes = Convert.FromBase64String(cipherText);
                var decrypted = decryptor.TransformFinalBlock(bytes, 0, bytes.Length);

                return Encoding.UTF8.GetString(decrypted);
            }
            catch (Exception ex)
            {
                return string.Empty;

            }
        }

        public string Base64Encode(string input)
        {
            return WebEncoders.Base64UrlEncode(System.Text.Encoding.UTF8.GetBytes(Encrypt(input)));
        }

        public string Base64DecodeToString(string? input)
        {
            try
            {
                var bytes = string.IsNullOrEmpty(input) ? null : WebEncoders.Base64UrlDecode(input);
                return ((bytes == null) ? "$$$$" : Decrypt(System.Text.Encoding.UTF8.GetString(bytes)));
            }
            catch (Exception ex)
            {
                return "$$$$";
            }
        }
    }
}
