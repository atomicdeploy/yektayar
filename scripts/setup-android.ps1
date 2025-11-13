# YektaYar Android Development Tooling Setup (Windows)
# This script installs and configures Android development tools for building the mobile app on Windows

# Requires PowerShell 5.1 or later and admin privileges for some operations

param(
    [switch]$SkipChocolatey = $false,
    [switch]$SkipWinget = $false
)

$ErrorActionPreference = "Stop"

# Colors for output (using Write-Host with -ForegroundColor)
function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Error-Message { param($Message) Write-Host "✗ $Message" -ForegroundColor Red }
function Write-Warning-Message { param($Message) Write-Host "⚠ $Message" -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Section { param($Message) Write-Host "`n========== $Message ==========" -ForegroundColor Blue }

Write-Section "YektaYar Android Tooling Setup (Windows)"

# Configuration
$JavaVersion = 17
$AndroidSdkRoot = if ($env:ANDROID_SDK_ROOT) { $env:ANDROID_SDK_ROOT } else { "$env:LOCALAPPDATA\Android\Sdk" }
$AndroidCmdlineToolsUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Function to check if command exists
function Test-CommandExists {
    param($Command)
    $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

# Function to set environment variable (user level)
function Set-EnvironmentVariableUser {
    param(
        [string]$Name,
        [string]$Value
    )
    
    try {
        [Environment]::SetEnvironmentVariable($Name, $Value, [EnvironmentVariableTarget]::User)
        Write-Success "Set $Name = $Value"
        # Also set for current session
        Set-Item -Path "env:$Name" -Value $Value
    } catch {
        Write-Warning-Message "Failed to set environment variable $Name"
    }
}

# Function to add to PATH (user level)
function Add-ToPath {
    param([string]$PathToAdd)
    
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", [EnvironmentVariableTarget]::User)
    
    if ($currentPath -notlike "*$PathToAdd*") {
        $newPath = "$PathToAdd;$currentPath"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, [EnvironmentVariableTarget]::User)
        Write-Success "Added $PathToAdd to PATH"
        # Also update current session
        $env:PATH = "$PathToAdd;$env:PATH"
    } else {
        Write-Warning-Message "$PathToAdd already in PATH"
    }
}

# Step 1: Install Java JDK 17
Write-Section "Step 1: Checking Java JDK $JavaVersion"

$javaInstalled = Test-CommandExists "java"

if ($javaInstalled) {
    $javaVersionOutput = java -version 2>&1 | Select-String "version" | Select-Object -First 1
    Write-Success "Java is installed: $javaVersionOutput"
    
    # Try to extract version number
    if ($javaVersionOutput -match '(\d+)\.') {
        $currentJavaVersion = [int]$Matches[1]
        
        if ($currentJavaVersion -ge $JavaVersion) {
            Write-Success "Java version is sufficient (>= $JavaVersion)"
        } else {
            Write-Warning-Message "Java version is too old. Need version $JavaVersion or higher"
            $javaInstalled = $false
        }
    }
}

if (-not $javaInstalled) {
    Write-Warning-Message "Java JDK $JavaVersion needs to be installed"
    
    # Try winget first (available on Windows 10 1809+ and Windows 11)
    if ((Test-CommandExists "winget") -and -not $SkipWinget) {
        Write-Info "Installing OpenJDK $JavaVersion using winget..."
        try {
            winget install --id EclipseAdoptium.Temurin.$JavaVersion.JDK -e --silent --accept-package-agreements --accept-source-agreements
            Write-Success "OpenJDK $JavaVersion installed via winget"
        } catch {
            Write-Warning-Message "Winget installation failed, trying Chocolatey..."
            $SkipWinget = $true
        }
    }
    
    # Try Chocolatey as fallback
    if ((Test-CommandExists "choco") -and -not $SkipChocolatey -and -not (Test-CommandExists "java")) {
        Write-Info "Installing OpenJDK $JavaVersion using Chocolatey..."
        
        if (Test-Administrator) {
            choco install openjdk$JavaVersion -y
            Write-Success "OpenJDK $JavaVersion installed via Chocolatey"
        } else {
            Write-Error-Message "Chocolatey requires administrator privileges"
            Write-Info "Please run this script as administrator or install manually"
            exit 1
        }
    }
    
    # If neither package manager worked, provide manual instructions
    if (-not (Test-CommandExists "java")) {
        Write-Error-Message "Could not install Java automatically"
        Write-Info "Please install Java JDK $JavaVersion manually from:"
        Write-Info "  https://adoptium.net/ (Recommended)"
        Write-Info "  or"
        Write-Info "  https://www.oracle.com/java/technologies/downloads/"
        exit 1
    }
}

# Step 2: Set JAVA_HOME
Write-Section "Step 2: Configuring JAVA_HOME"

if (-not $env:JAVA_HOME) {
    Write-Warning-Message "JAVA_HOME not set. Attempting to find Java installation..."
    
    # Try to find Java installation
    $javaBin = Get-Command java -ErrorAction SilentlyContinue
    if ($javaBin) {
        $javaPath = $javaBin.Source
        $javaHome = Split-Path (Split-Path $javaPath -Parent) -Parent
        
        if (Test-Path $javaHome) {
            Set-EnvironmentVariableUser "JAVA_HOME" $javaHome
            Write-Success "JAVA_HOME set to: $javaHome"
        }
    }
    
    if (-not $env:JAVA_HOME) {
        Write-Error-Message "Could not automatically determine JAVA_HOME"
        Write-Info "Please set JAVA_HOME manually in System Environment Variables"
        exit 1
    }
} else {
    Write-Success "JAVA_HOME is already set: $env:JAVA_HOME"
}

# Step 3: Install Android SDK Command-line Tools
Write-Section "Step 3: Checking Android SDK"

$sdkInstalled = Test-Path "$AndroidSdkRoot\cmdline-tools"

if ($sdkInstalled) {
    Write-Success "Android SDK found at: $AndroidSdkRoot"
} else {
    Write-Info "Android SDK not found. Installing..."
    
    # Create SDK directory
    New-Item -ItemType Directory -Force -Path $AndroidSdkRoot | Out-Null
    
    # Download Android command-line tools
    Write-Info "Downloading Android command-line tools..."
    $tempZip = "$env:TEMP\cmdline-tools.zip"
    
    try {
        Invoke-WebRequest -Uri $AndroidCmdlineToolsUrl -OutFile $tempZip -UseBasicParsing
        Write-Success "Download complete"
    } catch {
        Write-Error-Message "Failed to download Android command-line tools"
        Write-Info "Please download manually from: https://developer.android.com/studio#command-tools"
        exit 1
    }
    
    # Extract command-line tools
    Write-Info "Extracting command-line tools..."
    Expand-Archive -Path $tempZip -DestinationPath "$AndroidSdkRoot\cmdline-tools-temp" -Force
    
    # Reorganize directory structure
    New-Item -ItemType Directory -Force -Path "$AndroidSdkRoot\cmdline-tools\latest" | Out-Null
    Move-Item -Path "$AndroidSdkRoot\cmdline-tools-temp\cmdline-tools\*" -Destination "$AndroidSdkRoot\cmdline-tools\latest\" -Force
    Remove-Item -Path "$AndroidSdkRoot\cmdline-tools-temp" -Recurse -Force
    Remove-Item -Path $tempZip -Force
    
    Write-Success "Android command-line tools installed"
}

# Step 4: Set Android environment variables
Write-Section "Step 4: Configuring Android environment variables"

Set-EnvironmentVariableUser "ANDROID_SDK_ROOT" $AndroidSdkRoot
Set-EnvironmentVariableUser "ANDROID_HOME" $AndroidSdkRoot

# Add Android tools to PATH
Add-ToPath "$AndroidSdkRoot\cmdline-tools\latest\bin"
Add-ToPath "$AndroidSdkRoot\platform-tools"
Add-ToPath "$AndroidSdkRoot\build-tools\34.0.0"

# Step 5: Install Android SDK components
Write-Section "Step 5: Installing required Android SDK components"

$sdkmanager = "$AndroidSdkRoot\cmdline-tools\latest\bin\sdkmanager.bat"

if (Test-Path $sdkmanager) {
    Write-Info "Accepting Android SDK licenses..."
    # Accept licenses
    $licensesInput = "y`ny`ny`ny`ny`ny`ny`ny`n"
    $licensesInput | & $sdkmanager --licenses 2>&1 | Out-Null
    
    Write-Info "Installing SDK components (this may take a few minutes)..."
    & $sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "cmdline-tools;latest" 2>&1 | Out-Null
    
    Write-Success "Android SDK components installed"
} else {
    Write-Error-Message "SDK Manager not found at: $sdkmanager"
    exit 1
}

# Step 6: Verify installation
Write-Section "Step 6: Verifying installation"

Write-Info "Java version:"
java -version 2>&1 | Select-Object -First 3 | ForEach-Object { Write-Host $_ }

Write-Host ""
Write-Info "JAVA_HOME: $env:JAVA_HOME"
Write-Info "ANDROID_SDK_ROOT: $env:ANDROID_SDK_ROOT"
Write-Info "ANDROID_HOME: $env:ANDROID_HOME"
Write-Host ""

# Check if gradlew can run
$projectRoot = Split-Path $PSScriptRoot -Parent
$gradlewPath = "$projectRoot\packages\mobile-app\android\gradlew.bat"

if (Test-Path $gradlewPath) {
    Write-Info "Testing Gradle wrapper..."
    Push-Location "$projectRoot\packages\mobile-app\android"
    
    try {
        $gradleOutput = & .\gradlew.bat --version 2>&1
        Write-Success "Gradle wrapper is working"
    } catch {
        Write-Warning-Message "Gradle wrapper test failed, but tools are installed"
    }
    
    Pop-Location
}

# Final instructions
Write-Section "Android development tools setup complete!"

Write-Host ""
Write-Warning-Message "Important: Restart your terminal or IDE to apply environment changes"
Write-Host ""
Write-Info "To build the Android app, run:"
Write-Host "  npm run android:build" -ForegroundColor Cyan
Write-Host ""
Write-Info "To manually test gradle:"
Write-Host "  cd packages\mobile-app\android" -ForegroundColor Cyan
Write-Host "  .\gradlew.bat assembleDebug" -ForegroundColor Cyan
Write-Host ""
