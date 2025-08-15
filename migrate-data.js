// Script de migration des données vers mongodb-standalone
print("=== MIGRATION DES DONNEES ===");

// Connexion à la base source (externe)
var sourceDb = connect('mongodb://sabbar:6J457yC9VZ91N9W83YWt@167.172.96.88:27017/rocketchat?authSource=admin');

// Base locale (mongodb-standalone)
var targetDb = db.getSiblingDB('rocketchat');

// Collections à migrer pour le CronJob
var collectionsToMigrate = [
    'users',
    'personnel', 
    'rocketchat_message',
    '_raix_push_app_tokens'
];

collectionsToMigrate.forEach(function(collectionName) {
    print("\n=== Migration: " + collectionName + " ===");
    
    try {
        // Compter les documents dans la source
        var sourceCount = sourceDb[collectionName].countDocuments();
        print("Source: " + sourceCount + " documents");
        
        if (sourceCount > 0) {
            // Vider la collection cible
            targetDb[collectionName].deleteMany({});
            
            // Copier par batches de 100 documents pour éviter les timeouts
            var batchSize = 100;
            var totalCopied = 0;
            
            for (var skip = 0; skip < sourceCount; skip += batchSize) {
                var batch = sourceDb[collectionName].find().skip(skip).limit(batchSize).toArray();
                if (batch.length > 0) {
                    targetDb[collectionName].insertMany(batch);
                    totalCopied += batch.length;
                    if (totalCopied % 500 == 0) {
                        print("  Copié: " + totalCopied + "/" + sourceCount);
                    }
                }
            }
            
            var targetCount = targetDb[collectionName].countDocuments();
            print("✅ Migration terminée: " + targetCount + " documents copiés");
            
            // Vérification spécifique pour les utilisateurs avec téléphone
            if (collectionName === 'personnel') {
                var phoneCount = targetDb[collectionName].countDocuments({phone: {$ne: null, $exists: true}});
                print("   → Utilisateurs personnel avec téléphone: " + phoneCount);
            }
            
            if (collectionName === 'users') {
                var usersPhoneCount = targetDb[collectionName].countDocuments({'customFields.phone': {$ne: null, $exists: true}});
                print("   → Utilisateurs Rocket.Chat avec téléphone: " + usersPhoneCount);
            }
            
        } else {
            print("⚠️  Collection vide - ignorée");
        }
        
    } catch (error) {
        print("❌ Erreur pour " + collectionName + ": " + error.message);
    }
});

print("\n=== VERIFICATION FINALE ===");
collectionsToMigrate.forEach(function(collectionName) {
    try {
        var count = targetDb[collectionName].countDocuments();
        print(collectionName + " (local): " + count + " documents");
    } catch(e) {
        print(collectionName + " (local): ERROR");
    }
});

print("\n🎉 Migration terminée !");
print("La base mongodb-standalone contient maintenant les mêmes données.");
