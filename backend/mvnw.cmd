@REM Maven Wrapper for Windows
@REM Auto-downloads Maven if not present

@ECHO off
SET MAVEN_WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
SET MAVEN_WRAPPER_PROPERTIES="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"
SET DOWNLOAD_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"

FOR /F "usebackq tokens=1,2 delims==" %%A IN (%MAVEN_WRAPPER_PROPERTIES%) DO (
    IF "%%A"=="distributionUrl" SET DISTRIBUTION_URL=%%B
)

IF EXIST %MAVEN_WRAPPER_JAR% GOTO execute
IF "%MVNW_REPOURL%"=="" IF "%MVNW_USERNAME%"=="" IF "%MVNW_PASSWORD%"=="" (
    PowerShell -Command "&{"^
        "$webclient = new-object System.Net.WebClient;"^
        "if (-not ([string]::IsNullOrEmpty('%MVNW_USERNAME%') -and [string]::IsNullOrEmpty('%MVNW_PASSWORD%'))) {"^
            "$webclient.Credentials = new-object System.Net.NetworkCredential('%MVNW_USERNAME%', '%MVNW_PASSWORD%');"^
        "}"^
        "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $webclient.DownloadFile('%DOWNLOAD_URL%', '%MAVEN_WRAPPER_JAR%')"^
    "}"
)

:execute
SET MAVEN_JAVA_EXE="%JAVA_HOME%\bin\java.exe"
IF NOT EXIST %MAVEN_JAVA_EXE% SET MAVEN_JAVA_EXE=java

%MAVEN_JAVA_EXE% %JVM_CONFIG_MAVEN_PROPS% %MAVEN_OPTS% %MAVEN_DEBUG_OPTS% -classpath %MAVEN_WRAPPER_JAR% "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*
IF ERRORLEVEL 1 GOTO error
GOTO end
:error
SET ERROR_CODE=1
:end
@ENDLOCAL & SET ERROR_CODE=%ERROR_CODE%
IF NOT "%SUREFIRE_TIMEOUT%" == "" exit /B %ERROR_CODE%
IF "." == ".%SUREFIRE_TIMEOUT%" exit /B %ERROR_CODE%
EXIT /B %ERROR_CODE%
