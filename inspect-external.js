// Script pour inspecter la base externe (LECTURE SEULE)
print("=== INSPECTION BASE EXTERNE ===");

db = db.getSiblingDB('rocketchat');

print("=== COLLECTIONS DISPONIBLES ===");
var collections = db.getCollectionNames();
collections.forEach(function(collectionName) {
    var count = db[collectionName].countDocuments();
    print(collectionName + ": " + count + " documents");
});

print("\n=== UTILISATEURS AVEC TELEPHONE ===");
var usersWithPhone = 0;
if (db.users) {
    usersWithPhone = db.users.countDocuments({'customFields.phone': {$ne: null}});
}
print("Utilisateurs avec téléphone: " + usersWithPhone);

if (usersWithPhone > 0) {
    print("\n=== EXEMPLES D'UTILISATEURS ===");
    db.users.find({'customFields.phone': {$ne: null}}).limit(3).forEach(function(user) {
        print("- ID: " + user._id);
        print("  Nom: " + user.name);
        print("  Téléphone: " + user.customFields.phone);
        print("  Langue: " + user.language);
        print("  Dernière connexion: " + user.lastLogin);
        print("");
    });
}

print("=== MESSAGES ===");
var messageCount = db.rocketchat_message ? db.rocketchat_message.countDocuments() : 0;
print("Messages total: " + messageCount);

print("=== TOKENS PUSH ==="); 
var tokenCount = db._raix_push_app_tokens ? db._raix_push_app_tokens.countDocuments() : 0;
print("Tokens push: " + tokenCount);
