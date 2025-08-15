// Script pour inspecter la base externe - collection personnel
print("=== INSPECTION BASE EXTERNE ===");

db = db.getSiblingDB('rocketchat');

print("=== COLLECTIONS DISPONIBLES ===");
var collections = db.getCollectionNames();
collections.forEach(function(collectionName) {
    try {
        var count = db[collectionName].countDocuments();
        print(collectionName + ": " + count + " documents");
    } catch(e) {
        print(collectionName + ": ERROR - " + e.message);
    }
});

print("\n=== ANALYSE COLLECTION PERSONNEL ===");
if (db.personnel) {
    var personnelCount = db.personnel.countDocuments();
    print("Total personnel: " + personnelCount);
    
    print("\n=== STRUCTURE D'UN DOCUMENT PERSONNEL ===");
    var sampleDoc = db.personnel.findOne();
    if (sampleDoc) {
        print("Exemple de document:");
        printjson(sampleDoc);
    }
    
    print("\n=== RECHERCHE UTILISATEURS AVEC TELEPHONE ===");
    // Essayons différents champs possibles pour le téléphone
    var phoneFields = ['phone', 'telephone', 'customFields.phone', 'profile.phone'];
    phoneFields.forEach(function(field) {
        try {
            var query = {};
            query[field] = {$ne: null, $exists: true};
            var count = db.personnel.countDocuments(query);
            if (count > 0) {
                print(field + ": " + count + " documents avec téléphone");
            }
        } catch(e) {
            // Ignorer les erreurs de champ
        }
    });
}

print("\n=== RECHERCHE AUTRES COLLECTIONS UTILISATEURS ===");
collections.forEach(function(collectionName) {
    if (collectionName.toLowerCase().includes('user') || collectionName.toLowerCase().includes('people')) {
        try {
            var count = db[collectionName].countDocuments();
            print("Collection utilisateur potentielle: " + collectionName + " (" + count + " docs)");
        } catch(e) {
            // Ignorer
        }
    }
});
