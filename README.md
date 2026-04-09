# 🏋️‍♂️ UpGym - Gestión de Entrenamiento y Fidelización

UpGym es una aplicación móvil híbrida diseñada para transformar la experiencia en el gimnasio. No es solo un tracker de rutinas; es un ecosistema completo que motiva a los usuarios a través de un sistema de **rachas dinámicas** y una **tienda de recompensas** integrada.

---

## 🚀 Características Principales

* **Check-in Inteligente:** Registro de asistencia mediante escaneo (simulado para demo) que activa el contador de racha.
* **Sistema de Rachas (Streaks):** Lógica automatizada en Base de Datos que premia la constancia diaria.
* **Tienda de Recompensas:** Los usuarios ganan puntos por entrenar y pueden canjearlos por productos reales (suplementos, ropa, descuentos).
* **Tickets de Canje:** Generación de códigos alfanuméricos únicos para validación física en la recepción del gimnasio.
* **Interfaz de Usuario (UI):** Diseño limpio, moderno y optimizado para dispositivos móviles usando Tailwind CSS.

---

## 🛠️ Stack Tecnológico

### Frontend
* **React + Vite:** Para una interfaz rápida y reactiva.
* **Tailwind CSS:** Estilizado moderno y responsivo.
* **Capacitor:** Para convertir la web app en una aplicación móvil nativa.

### Backend
* **Node.js & Express:** Servidor robusto para la API REST.
* **JWT (JSON Web Tokens):** Autenticación segura de usuarios.
* **Bcrypt:** Encriptación de contraseñas.

### Base de Datos (MySQL)
El corazón de UpGym reside en su lógica de base de datos para garantizar la integridad de los puntos y el stock:
* **Triggers:** Automatización del historial de puntos y actualización de stock en tiempo real al realizar canjes.
* **Stored Procedures:** Transacciones seguras para el procesamiento de reclamos de premios y manejo de rachas.
* **Funciones:** Consultas de saldo calculadas directamente en el motor de BD.

---

## 🏗️ Arquitectura de Seguridad (Demo Stage)

Para la versión actual, se han implementado medidas de integridad referencial:
* **Transacciones SQL:** Uso de `START TRANSACTION` y `FOR UPDATE` para prevenir condiciones de carrera (ej. dos usuarios canjeando el último premio al mismo tiempo).
* **Validación por Trigger:** Bloqueo de inserciones si el saldo de puntos es insuficiente o el premio está inactivo.
* **Protección de Rutas:** Middleware de autenticación que valida la identidad del usuario antes de cualquier movimiento de puntos.

---


## 👤 Autores
* **Jesús Eduardo Toledo Valdez.**
* **Yahir Fernando Sanchéz Delgado.**
* **Abransa Paulina Guevara Moran.** 
* **Gabino de Jesús Urias Escalante.**

---
*Este proyecto es una demo funcional desarrollada para fines académicos.*
