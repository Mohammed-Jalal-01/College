using System.Text.RegularExpressions;

namespace CollegeAPI.Validators;

public static class PasswordValidator
{
    private static readonly string[] CommonPasswords = new[]
    {
        "password", "123456", "12345678", "qwerty", "abc123", "monkey", "1234567",
        "letmein", "trustno1", "dragon", "baseball", "iloveyou", "master", "sunshine",
        "ashley", "bailey", "passw0rd", "shadow", "123123", "654321", "superman",
        "qazwsx", "michael", "football", "welcome", "jesus", "ninja", "mustang",
        "password1", "123456789", "password123", "admin", "root", "toor"
    };

    public static PasswordValidationResult ValidatePassword(string password)
    {
        var result = new PasswordValidationResult { IsValid = true };

        if (string.IsNullOrWhiteSpace(password))
        {
            result.IsValid = false;
            result.Errors.Add("Password is required");
            return result;
        }

        if (password.Length < 8)
        {
            result.IsValid = false;
            result.Errors.Add("Password must be at least 8 characters long");
        }

        if (password.Length > 128)
        {
            result.IsValid = false;
            result.Errors.Add("Password must not exceed 128 characters");
        }

        if (!Regex.IsMatch(password, @"[A-Z]"))
        {
            result.IsValid = false;
            result.Errors.Add("Password must contain at least one uppercase letter");
        }

        if (!Regex.IsMatch(password, @"[a-z]"))
        {
            result.IsValid = false;
            result.Errors.Add("Password must contain at least one lowercase letter");
        }

        if (!Regex.IsMatch(password, @"[0-9]"))
        {
            result.IsValid = false;
            result.Errors.Add("Password must contain at least one number");
        }

        if (!Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]"))
        {
            result.IsValid = false;
            result.Errors.Add("Password must contain at least one special character (!@#$%^&*()_+-=[]{}etc.)");
        }

        if (ContainsCommonPassword(password))
        {
            result.IsValid = false;
            result.Errors.Add("Password is too common. Please choose a more secure password");
        }

        if (HasRepeatingCharacters(password))
        {
            result.IsValid = false;
            result.Errors.Add("Password contains too many repeating characters");
        }

        if (HasSequentialCharacters(password))
        {
            result.IsValid = false;
            result.Errors.Add("Password contains sequential characters (e.g., 'abc', '123')");
        }

        return result;
    }

    private static bool ContainsCommonPassword(string password)
    {
        var lowerPassword = password.ToLower();
        return CommonPasswords.Any(common => lowerPassword.Contains(common));
    }

    private static bool HasRepeatingCharacters(string password)
    {
        for (int i = 0; i < password.Length - 2; i++)
        {
            if (password[i] == password[i + 1] && password[i] == password[i + 2])
            {
                return true;
            }
        }
        return false;
    }

    private static bool HasSequentialCharacters(string password)
    {
        var lowerPassword = password.ToLower();
        
        for (int i = 0; i < lowerPassword.Length - 2; i++)
        {
            if (lowerPassword[i] + 1 == lowerPassword[i + 1] && 
                lowerPassword[i + 1] + 1 == lowerPassword[i + 2])
            {
                return true;
            }
        }
        return false;
    }

    public static int CalculatePasswordStrength(string password)
    {
        int strength = 0;

        if (password.Length >= 8) strength += 1;
        if (password.Length >= 12) strength += 1;
        if (password.Length >= 16) strength += 1;
        
        if (Regex.IsMatch(password, @"[a-z]")) strength += 1;
        if (Regex.IsMatch(password, @"[A-Z]")) strength += 1;
        if (Regex.IsMatch(password, @"[0-9]")) strength += 1;
        if (Regex.IsMatch(password, @"[!@#$%^&*()_+\-=\[\]{};':""\\|,.<>\/?]")) strength += 2;

        if (!ContainsCommonPassword(password)) strength += 1;
        if (!HasRepeatingCharacters(password)) strength += 1;
        if (!HasSequentialCharacters(password)) strength += 1;

        return Math.Min(strength, 10);
    }
}

public class PasswordValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new List<string>();
}
