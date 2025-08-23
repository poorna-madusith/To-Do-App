using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;

namespace ToDo_backend.Helpers;

public class FireBaseHelper
{
    private static FirebaseApp _firebaseapp;

    public static void Initialize()
    {
        if (_firebaseapp == null)
        {
            _firebaseapp = FirebaseApp.Create(new AppOptions()
            {
                Credential = GoogleCredential.FromFile("firebase-adminsdk.json")
            });
        }
    }
    
    public static async Task<FirebaseToken> VerifyToken(string token)
    {
        return await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);
    }
}