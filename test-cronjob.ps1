# Script de test pour le CronJob govcom
param(
    [int]$TimeoutMinutes = 60
)

Write-Host "🧪 Test du CronJob govcom avec timeout de $TimeoutMinutes minutes" -ForegroundColor Green
Write-Host "================================================"

$jobName = "govcom-test-job"
$namespace = "ibtikarchart"
$startTime = Get-Date

# Fonction pour vérifier le statut
function Get-JobStatus {
    $status = kubectl get job $jobName -n $namespace --no-headers 2>$null
    if ($status) {
        return $status.Split()[1]  # STATUS column
    }
    return "NotFound"
}

# Fonction pour obtenir les logs récents
function Get-RecentLogs {
    $podName = (kubectl get pods -n $namespace --selector=job-name=$jobName --no-headers 2>$null | Select-Object -First 1).Split()[0]
    if ($podName) {
        kubectl logs $podName -n $namespace --tail=5 2>$null
    }
}

# Surveillance
$endTime = (Get-Date).AddMinutes($TimeoutMinutes)
while ((Get-Date) -lt $endTime) {
    $currentTime = Get-Date
    $elapsed = ($currentTime - $startTime).ToString("hh\:mm\:ss")
    $status = Get-JobStatus
    
    Write-Host "[$elapsed] Status: $status" -ForegroundColor Yellow
    
    if ($status -eq "Complete") {
        Write-Host "✅ Job terminé avec succès !" -ForegroundColor Green
        break
    }
    elseif ($status -eq "Failed") {
        Write-Host "❌ Job échoué" -ForegroundColor Red
        kubectl describe job $jobName -n $namespace
        break
    }
    elseif ($status -eq "NotFound") {
        Write-Host "ℹ️  Job introuvable - peut-être supprimé par timeout" -ForegroundColor Blue
        break
    }
    
    # Afficher quelques logs récents
    $logs = Get-RecentLogs
    if ($logs) {
        Write-Host "📋 Logs récents:" -ForegroundColor Cyan
        $logs | ForEach-Object { Write-Host "   $_" }
    }
    
    Start-Sleep -Seconds 30
}

Write-Host "`n🏁 Test terminé à $(Get-Date)" -ForegroundColor Green

# Nettoyage optionnel
$cleanup = Read-Host "Voulez-vous supprimer le job de test ? (y/n)"
if ($cleanup -eq 'y') {
    kubectl delete job $jobName -n $namespace
    Write-Host "🧹 Job de test supprimé" -ForegroundColor Green
}
