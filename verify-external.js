// Script de vérification - Base externe (LECTURE SEULE)
print("=== VERIFICATION BASE EXTERNE ===");
print("Vérification que TOUTES les données sont encore présentes");

db = db.getSiblingDB('rocketchat');

print("\n=== COLLECTIONS PRINCIPALES ===");
var criticalCollections = [
    'users',
    'personnel', 
    'rocketchat_message',
    'structures',
    'rocketchat_room',
    'rocketchat_subscription'
];

var totalDocuments = 0;

criticalCollections.forEach(function(collectionName) {
    try {
        var count = db[collectionName].countDocuments();
        print(collectionName + ": " + count + " documents");
        totalDocuments += count;
    } catch(e) {
        print(collectionName + ": ERROR - " + e.message);
    }
});

print("\nTotal documents dans les collections principales: " + totalDocuments);

print("\n=== VERIFICATION UTILISATEURS AVEC TELEPHONE ===");
// Vérifier les utilisateurs Rocket.Chat
try {
    var rcUsers = db.users.countDocuments({'customFields.phone': {$ne: null, $exists: true}});
    print("Utilisateurs Rocket.Chat avec téléphone: " + rcUsers);
    
    if (rcUsers > 0) {
        print("\nExemples d'utilisateurs Rocket.Chat:");
        db.users.find({'customFields.phone': {$ne: null}}).limit(2).forEach(function(user) {
            print("- " + user.name + " (" + user.customFields.phone + ")");
        });
    }
} catch(e) {
    print("Erreur utilisateurs RC: " + e.message);
}

// Vérifier les personnels
try {
    var personnel = db.personnel.countDocuments({phone: {$ne: null, $exists: true}});
    print("Personnel avec téléphone: " + personnel);
    
    if (personnel > 0) {
        print("\nExemples de personnel:");
        db.personnel.find({phone: {$ne: null}}).limit(2).forEach(function(user) {
            print("- " + user.nomFr + " " + user.prenomFr + " (" + user.phone + ")");
        });
    }
} catch(e) {
    print("Erreur personnel: " + e.message);
}

print("\n=== VERIFICATION MESSAGES ===");
try {
    var messageCount = db.rocketchat_message.countDocuments();
    print("Messages total: " + messageCount);
    
    var recentMessages = db.rocketchat_message.countDocuments({
        ts: {$gte: new Date('2025-01-01')}
    });
    print("Messages depuis 2025: " + recentMessages);
} catch(e) {
    print("Erreur messages: " + e.message);
}

print("\n=== VERIFICATION STRUCTURES ===");
try {
    var structCount = db.structures.countDocuments();
    print("Structures: " + structCount);
} catch(e) {
    print("Erreur structures: " + e.message);
}

print("\n✅ VERIFICATION TERMINEE");
print("La base externe est-elle intacte ? Voir les résultats ci-dessus.");
