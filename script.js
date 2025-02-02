document.addEventListener("DOMContentLoaded", () => {
    const tablero = document.querySelector(".tablero");
    const celdas = document.querySelectorAll(".celda");
    const mensaje = document.getElementById("mensaje");
    const reiniciarBtn = document.getElementById("reiniciar");
    const nivelSelect = document.getElementById("nivel");
    const registroForm = document.getElementById("form-registro");
    const nombreJugadorInput = document.getElementById("nombreJugador");
    const registroDiv = document.getElementById("registro");
    const juegoDiv = document.getElementById("juego");

    let jugador = "X";
    let ia = "O";
    let nombreJugador = "";
    let tableroActual = ["", "", "", "", "", "", "", "", ""];
    let juegoActivo = true;

    const combinacionesGanadoras = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    // Manejar el registro del jugador y enviar los datos al servidor
    registroForm.addEventListener("submit", (e) => {
        e.preventDefault();
        nombreJugador = nombreJugadorInput.value.trim();

        if (nombreJugador === "") {
            alert("Por favor, ingresa tu nombre para jugar.");
            return;
        }

        // Enviar el nombre al servidor usando fetch
        fetch("guardar_jugador.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `nombre=${encodeURIComponent(nombreJugador)}`,
        })
            .then((response) => response.text())
            .then((data) => {
                console.log(data); // Mostrar el mensaje del servidor en la consola
            })
            .catch((error) => {
                console.error("Error al registrar el jugador:", error);
            });

        // Ocultar la pantalla de registro y mostrar el juego
        registroDiv.style.display = "none";
        juegoDiv.style.display = "block";
    });

    celdas.forEach(celda => {
        celda.addEventListener("click", () => {
            if (!juegoActivo || celda.textContent !== "") return;

            celda.textContent = jugador;
            tableroActual[celda.dataset.index] = jugador;

            if (verificarGanador(jugador)) {
                mensaje.textContent = `¡Ganaste, ${nombreJugador}!`;
                juegoActivo = false;
                return;
            }

            if (!tableroActual.includes("")) {
                mensaje.textContent = "¡Empate!";
                juegoActivo = false;
                return;
            }

            setTimeout(() => {
                jugarIA();
            }, 500);
        });
    });

    nivelSelect.addEventListener("change", () => {
        reiniciarJuego();
    });

    reiniciarBtn.addEventListener("click", () => {
        reiniciarJuego();
    });

    function reiniciarJuego() {
        tableroActual = ["", "", "", "", "", "", "", "", ""];
        juegoActivo = true;
        mensaje.textContent = "";
        celdas.forEach(celda => (celda.textContent = ""));
    }

    function jugarIA() {
        let nivel = nivelSelect.value;
        let movimiento;

        if (nivel === "facil") {
            movimiento = movimientoAleatorio();
        } else if (nivel === "medio") {
            movimiento = movimientoEstrategico();
        } else {
            movimiento = mejorMovimiento();
        }

        if (movimiento !== -1) {
            celdas[movimiento].textContent = ia;
            tableroActual[movimiento] = ia;

            if (verificarGanador(ia)) {
                mensaje.textContent = "El rival contrario ganó";
                juegoActivo = false;
                return;
            }

            if (!tableroActual.includes("")) {
                mensaje.textContent = "¡Empate!";
                juegoActivo = false;
            }
        }
    }

    function movimientoAleatorio() {
        let disponibles = tableroActual.map((val, i) => val === "" ? i : null).filter(val => val !== null);
        return disponibles[Math.floor(Math.random() * disponibles.length)];
    }

    function movimientoEstrategico() {
        for (let combo of combinacionesGanadoras) {
            let [a, b, c] = combo;
            let valores = [tableroActual[a], tableroActual[b], tableroActual[c]];
            if (valores.filter(val => val === ia).length === 2 && valores.includes("")) {
                return combo[valores.indexOf("")];
            }
        }
        for (let combo of combinacionesGanadoras) {
            let [a, b, c] = combo;
            let valores = [tableroActual[a], tableroActual[b], tableroActual[c]];
            if (valores.filter(val => val === jugador).length === 2 && valores.includes("")) {
                return combo[valores.indexOf("")];
            }
        }
        return movimientoAleatorio();
    }

    function mejorMovimiento() {
        return movimientoEstrategico() || movimientoAleatorio();
    }

    function verificarGanador(jugador) {
        return combinacionesGanadoras.some(combo => combo.every(i => tableroActual[i] === jugador));
    }
});
