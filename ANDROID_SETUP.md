# 📱 Guía de Setup Android - Kaelo App

Esta guía está diseñada para desarrolladores que quieren ejecutar la app Kaelo en su dispositivo Android.

> ⚠️ **Importante:** Esta app usa código nativo (Mapbox, expo-location) y **NO funciona con Expo Go**. Debes compilar el proyecto en tu máquina.

---

## 🎯 Tabla de Contenidos

1. [Pre-requisitos](#-pre-requisitos)
2. [Instalación de Android Studio](#-instalación-de-android-studio)
3. [Configuración de Variables de Entorno](#-configuración-de-variables-de-entorno)
4. [Setup del Proyecto](#-setup-del-proyecto)
5. [Ejecutar en Dispositivo Físico](#-opción-a-dispositivo-físico-recomendado)
6. [Ejecutar en Emulador](#-opción-b-emulador-android)
7. [Solución de Problemas](#-solución-de-problemas-comunes)

---

## 📋 Pre-requisitos

### Software Necesario:

| Software           | Versión Mínima     | Link de Descarga                                              |
| ------------------ | ------------------ | ------------------------------------------------------------- |
| **Node.js**        | 18+                | [nodejs.org](https://nodejs.org/)                             |
| **Yarn**           | 1.22+              | `npm install -g yarn`                                         |
| **Android Studio** | Hedgehog+ (2023.1) | [developer.android.com](https://developer.android.com/studio) |
| **JDK**            | 17                 | Incluido en Android Studio                                    |
| **Git**            | 2.0+               | [git-scm.com](https://git-scm.com/)                           |

### Hardware Recomendado:

- **RAM:** 8GB mínimo, 16GB recomendado
- **Espacio en disco:** 10GB libres
- **Procesador:** Core i5 o equivalente

---

## 🔧 Instalación de Android Studio

### Paso 1: Descargar e instalar

1. Ve a [developer.android.com/studio](https://developer.android.com/studio)
2. Descarga Android Studio para tu sistema operativo
3. Ejecuta el instalador y sigue las instrucciones

### Paso 2: Instalación inicial

Durante la primera ejecución de Android Studio:

1. Selecciona **"Standard"** installation
2. Acepta las licencias
3. Espera a que descargue los componentes (puede tardar 15-30 min)

### Paso 3: Configurar SDK de Android

1. Abre Android Studio
2. Ve a `Settings` (o `Preferences` en macOS):
   - **Windows/Linux:** `File > Settings`
   - **macOS:** `Android Studio > Preferences`

3. Navega a: `Appearance & Behavior > System Settings > Android SDK`

4. En la pestaña **"SDK Platforms"**, marca:
   - ✅ Android 14.0 (API Level 34) - **REQUERIDO**
   - ✅ Android 13.0 (API Level 33)
   - ✅ Android 12.0 (API Level 31)

5. En la pestaña **"SDK Tools"**, marca:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Platform-Tools
   - ✅ Android Emulator
   - ✅ Intel x86 Emulator Accelerator (HAXM) - Solo Windows/macOS Intel

6. Click en **"Apply"** y espera la descarga (5-10 GB)

### Paso 4: Configurar variables de entorno del sistema

#### En macOS/Linux:

Agrega esto a tu `~/.zshrc` o `~/.bashrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Luego ejecuta:

```bash
source ~/.zshrc  # o source ~/.bashrc
```

#### En Windows:

1. Abre `Panel de Control > Sistema > Configuración avanzada del sistema`
2. Click en `Variables de entorno`
3. En "Variables del sistema", click `Nueva`:
   - **Nombre:** `ANDROID_HOME`
   - **Valor:** `C:\Users\TU_USUARIO\AppData\Local\Android\Sdk`
4. Edita la variable `Path` y agrega:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`

#### Verificar instalación:

```bash
adb version
# Debería mostrar: Android Debug Bridge version X.X.X

echo $ANDROID_HOME
# macOS/Linux: Debería mostrar /Users/tu-usuario/Library/Android/sdk
# Windows: C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
```

---

## 🔐 Configuración de Variables de Entorno

### Paso 1: Copiar el archivo de ejemplo

```bash
cd kaelo-app-production
cp .env.example .env
```

### Paso 2: Obtener credenciales

Contacta al administrador del proyecto para obtener:

- **MAPBOX_ACCESS_TOKEN** → Token de Mapbox
- **SUPABASE_URL** → URL del proyecto de Supabase
- **SUPABASE_ANON_KEY** → Clave anónima de Supabase

### Paso 3: Editar `.env`

```env
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiVFVfVVNVQVJJTyIsImEiOiJ...
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Nunca commitees el archivo `.env` a Git**

---

## 📦 Setup del Proyecto

### Paso 1: Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd kaelo-app-production
```

### Paso 2: Instalar dependencias

```bash
yarn install

# Si no tienes yarn:
npm install
```

Esto instalará:

- Todas las dependencias de npm
- Dependencias nativas de React Native
- Configurará expo-modules

⏱️ **Tiempo estimado:** 2-5 minutos

### Paso 3: Configurar archivo `local.properties` (Solo la primera vez)

```bash
# macOS/Linux
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties

# Windows (PowerShell)
echo "sdk.dir=C:\Users\$env:USERNAME\AppData\Local\Android\Sdk" > android/local.properties
```

---

## 📱 Opción A: Dispositivo Físico (Recomendado)

### Ventajas:

- ✅ Más rápido que el emulador
- ✅ Prueba con hardware real (GPS, sensores)
- ✅ Menor consumo de recursos en tu PC

### Paso 1: Habilitar Modo Desarrollador

1. Abre **Ajustes** en tu teléfono Android
2. Ve a **Acerca del teléfono** (o **Información del dispositivo**)
3. Busca **"Número de compilación"** o **"Build number"**
4. Toca **7 veces** sobre ese número
5. Verás un mensaje: _"Ahora eres un desarrollador"_

### Paso 2: Habilitar Depuración USB

1. Vuelve al menú principal de **Ajustes**
2. Verás una nueva opción: **Opciones de desarrollador** (o **Developer Options**)
3. Activa el switch principal de **Opciones de desarrollador**
4. Busca y activa **"Depuración USB"** o **"USB Debugging"**
5. (Opcional) Activa **"Install via USB"** si está disponible

### Paso 3: Conectar tu dispositivo

1. **Conecta tu teléfono a la PC con un cable USB** (preferiblemente el cable original)
2. En tu teléfono, aparecerá un prompt: **"¿Permitir depuración USB?"**
3. Marca ✅ **"Permitir siempre desde esta computadora"**
4. Toca **"Permitir"** o **"OK"**

### Paso 4: Verificar conexión

```bash
adb devices
```

**Respuesta esperada:**

```
List of devices attached
A1B2C3D4E5F6    device
```

Si dice `unauthorized`:

- Desconecta y reconecta el USB
- Acepta el prompt en tu teléfono
- Si no aparece, ve a `Opciones de desarrollador > Revocar autorizaciones USB`

### Paso 5: Compilar e instalar la app

```bash
npx expo run:android

# O usando el script:
yarn android
```

**¿Qué pasa durante la compilación?**

1. **Gradle descarga dependencias** (primera vez: 1-3 min)
2. **Compila el código nativo** (5-15 min)
3. **Instala el APK en tu teléfono** (30 seg)
4. **Inicia Metro Bundler** (servidor de desarrollo)
5. **Abre la app automáticamente**

⏱️ **Primera compilación:** 10-20 minutos  
⏱️ **Siguientes compilaciones:** 2-5 minutos

### Paso 6: Desarrollo en vivo

Una vez instalada, para cambios futuros en el código JavaScript/TypeScript:

```bash
# Solo inicia el servidor
yarn start

# La app se actualizará automáticamente (Fast Refresh)
```

Solo necesitas volver a ejecutar `yarn android` cuando:

- Instales/actualices una dependencia nativa
- Cambies configuración en `app.json`
- Modifiques archivos en `/android/`

---

## 🖥️ Opción B: Emulador Android

### Ventajas:

- ✅ No necesitas dispositivo físico
- ✅ Puedes simular diferentes dispositivos y versiones de Android

### Desventajas:

- ❌ Más lento
- ❌ Consume más recursos (RAM, CPU)
- ❌ GPS simulado (no tan preciso)

### Paso 1: Crear un emulador (AVD)

1. Abre **Android Studio**
2. En la pantalla de bienvenida, click en **"More Actions"** (⋮)
3. Selecciona **"Virtual Device Manager"**
4. Click en **"Create Device"**

### Paso 2: Seleccionar hardware

1. Categoría: **"Phone"**
2. Dispositivo recomendado: **"Pixel 6"** o **"Pixel 5"**
   - Tiene buen balance de rendimiento y realismo
3. Click **"Next"**

### Paso 3: Seleccionar imagen del sistema

1. Pestaña: **"Recommended"**
2. Selecciona: **"Tiramisu"** (API Level 33) o **"UpsideDownCake"** (API Level 34)
3. Click en **"Download"** si no está descargada (espera 5-10 min)
4. Una vez descargada, selecciónala y click **"Next"**

### Paso 4: Configuración del AVD

1. **Nombre:** Ponle un nombre descriptivo (ej: `Pixel_6_API_34`)
2. **Startup orientation:** Portrait
3. **Show Advanced Settings** (opcional):
   - **RAM:** 2048 MB mínimo (si tu PC tiene 16GB RAM, pon 4096 MB)
   - **Internal Storage:** 2048 MB
   - **SD Card:** 512 MB
4. Click **"Finish"**

### Paso 5: Iniciar el emulador

#### Desde Android Studio:

1. En **Device Manager**, busca tu AVD
2. Click en el botón **▶️ Play**
3. Espera 1-3 minutos a que arranque

#### Desde terminal:

```bash
# Listar AVDs disponibles
emulator -list-avds

# Iniciar un AVD específico
emulator -avd Pixel_6_API_34
```

### Paso 6: Compilar e instalar

Con el emulador ya iniciado:

```bash
npx expo run:android
```

Expo detectará automáticamente el emulador y desplegará la app allí.

---

## 🐛 Solución de Problemas Comunes

### ❌ Error: "SDK location not found"

**Causa:** Android no encuentra el SDK de Android.

**Solución:**

```bash
# macOS/Linux
echo "sdk.dir=$HOME/Library/Android/sdk" > android/local.properties

# Windows
echo "sdk.dir=C:\Users\TU_USUARIO\AppData\Local\Android\Sdk" > android/local.properties
```

Reemplaza `TU_USUARIO` con tu nombre de usuario de Windows.

---

### ❌ Error: "adb: device unauthorized"

**Causa:** Tu teléfono no ha autorizado la depuración USB desde esta PC.

**Solución:**

1. Desconecta el cable USB
2. En tu teléfono: `Opciones de desarrollador > Revocar autorizaciones de depuración USB`
3. Reconecta el cable USB
4. Acepta el prompt de autorización
5. Marca "Permitir siempre desde esta computadora"

---

### ❌ Error: "Execution failed for task ':app:mergeDebugResources'"

**Causa:** Cache de Gradle corrupto.

**Solución:**

```bash
cd android
./gradlew clean
cd ..
yarn android
```

---

### ❌ Error: "Unable to load script. Make sure you're running Metro"

**Causa:** Metro bundler no está corriendo o el teléfono no se puede conectar.

**Solución:**

```bash
# 1. Configurar reverse proxy
adb reverse tcp:8081 tcp:8081

# 2. Reiniciar Metro
# Ctrl+C para detenerlo
yarn start --reset-cache

# 3. Recargar la app
# En el teléfono: Presiona 'r' dos veces rápidamente
```

---

### ❌ Error: "INSTALL_FAILED_INSUFFICIENT_STORAGE"

**Causa:** No hay espacio en el dispositivo.

**Solución:**

1. Libera espacio en tu teléfono (fotos, videos, apps no usadas)
2. O desinstala la app anterior:
   ```bash
   adb uninstall com.anonymous.kaeloappproduction
   ```

---

### ❌ El emulador es muy lento

**Soluciones:**

1. **Habilitar aceleración por hardware:**
   - Windows/Linux: Habilitar Intel HAXM
   - macOS: Habilitar Hypervisor Framework

2. **Reducir RAM del emulador:**
   - En Device Manager, edita tu AVD
   - Reduce RAM a 2048 MB

3. **Usar dispositivo físico** en su lugar (más rápido)

---

### ❌ Error: "Gradle build failed with exit code 1"

**Solución general:**

```bash
# 1. Limpiar proyecto
cd android
./gradlew clean
./gradlew --stop
cd ..

# 2. Borrar caché de npm
rm -rf node_modules
yarn cache clean
yarn install

# 3. Borrar carpetas de build
rm -rf android/app/build
rm -rf android/build

# 4. Intentar de nuevo
yarn android
```

---

### ❌ Metro bundler no se inicia automáticamente

**Solución:**

```bash
# Terminal 1: Iniciar Metro manualmente
yarn start

# Terminal 2: Compilar e instalar la app
yarn android
```

---

## 🔄 Flujo de Desarrollo Diario

Una vez que tienes todo configurado:

### Primera vez del día:

```bash
# 1. Conecta tu teléfono (o inicia el emulador)
adb devices

# 2. Inicia Metro bundler
yarn start
```

### Cuando hagas cambios en el código:

- **Cambios en JS/TS:** Se actualizan automáticamente (Fast Refresh)
- **Cambios en estilos:** Se actualizan automáticamente
- **Agregar nuevas pantallas:** Se actualizan automáticamente

### Solo recompila cuando:

```bash
yarn android  # Solo cuando cambies:
              # - Dependencias nativas
              # - Configuración en app.json
              # - Archivos en /android/
```

---

## 📊 Tiempos Estimados

| Acción                             | Primera Vez | Siguiente Veces |
| ---------------------------------- | ----------- | --------------- |
| Instalar Android Studio            | 30-60 min   | -               |
| Instalar dependencias del proyecto | 3-5 min     | 30 seg          |
| Primera compilación                | 10-20 min   | -               |
| Recompilaciones                    | -           | 2-5 min         |
| Iniciar Metro                      | 30 seg      | 30 seg          |
| Hot Reload (cambios)               | <1 seg      | <1 seg          |

---

## 🎓 Recursos Adicionales

- [Documentación oficial de Expo](https://docs.expo.dev/)
- [React Native docs](https://reactnative.dev/docs/environment-setup)
- [Android Studio User Guide](https://developer.android.com/studio/intro)
- [Mapbox for React Native](https://github.com/rnmapbox/maps)

---

## 📞 ¿Necesitas Ayuda?

Si encuentras algún problema no listado aquí:

1. Revisa [GitHub Issues](link-a-tu-repo/issues)
2. Crea un nuevo issue con:
   - Sistema operativo y versión
   - Versión de Node.js (`node -v`)
   - Mensaje de error completo
   - Pasos para reproducir el error

---

**¡Feliz desarrollo! 🚀**
