// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarFecha();
    configurarEventListeners();
    actualizarTotales();
});

// Variables globales
let materiales = [];
let manoObra = [];

// Inicializar fecha actual
function inicializarFecha() {
    const fechaInput = document.getElementById('fecha');
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.value = hoy;
}

// Configurar event listeners
function configurarEventListeners() {
    // Agregar materiales
    document.getElementById('agregar-material').addEventListener('click', agregarMaterial);
    document.getElementById('material-descripcion').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') agregarMaterial();
    });
    document.getElementById('material-cantidad').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') agregarMaterial();
    });
    document.getElementById('material-precio').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') agregarMaterial();
    });
    // Campos especiales para peso
    const tipoUnidadSelect = document.getElementById('material-tipo-unidad');
    const precioPor100gInput = document.getElementById('material-precio-unidad-peso');
    const precioPorKiloInput = document.getElementById('material-precio-kilo');
    if (precioPor100gInput) {
        precioPor100gInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') agregarMaterial();
        });
    }
    if (precioPorKiloInput) {
        precioPorKiloInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') agregarMaterial();
        });
    }
    if (tipoUnidadSelect) {
        tipoUnidadSelect.addEventListener('change', function() {
            const tipo = this.value;
            const precioUnitario = document.getElementById('material-precio');
            if (precioUnitario) precioUnitario.style.display = 'none';
            if (precioPor100gInput) {
                precioPor100gInput.style.display = 'none';
                precioPor100gInput.value = '';
            }
            if (precioPorKiloInput) {
                precioPorKiloInput.style.display = 'none';
                precioPorKiloInput.value = '';
            }

            if (tipo === 'gramos' && precioPor100gInput) {
                precioPor100gInput.style.display = 'block';
                precioPor100gInput.placeholder = 'Precio por 100g';
            } else if (tipo === 'kilos' && precioPorKiloInput) {
                precioPorKiloInput.style.display = 'block';
                precioPorKiloInput.placeholder = 'Precio por kg';
            } else if (precioUnitario) {
                precioUnitario.style.display = 'block';
            }
        });
    }
    document.getElementById('material-precio-unidad-peso').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') agregarMaterial();
    });
    document.getElementById('material-precio-kilo').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') agregarMaterial();
    });
    
    // Mostrar/ocultar campo de precio por peso según el tipo de unidad
    document.getElementById('material-tipo-unidad').addEventListener('change', function() {
        const tipoUnidad = this.value;
        const precioUnitario = document.getElementById('material-precio');
        const precioPeso = document.getElementById('material-precio-unidad-peso');
        const precioKilo = document.getElementById('material-precio-kilo');
        
        // Ocultar todos primero
        precioUnitario.style.display = 'none';
        precioPeso.style.display = 'none';
        precioKilo.style.display = 'none';
        precioPeso.value = '';
        precioKilo.value = '';
        
        if (tipoUnidad === 'gramos') {
            precioPeso.style.display = 'block';
            precioPeso.placeholder = 'Precio por 100g';
        } else if (tipoUnidad === 'kilos') {
            precioKilo.style.display = 'block';
            precioKilo.placeholder = 'Precio por kg';
        } else {
            precioUnitario.style.display = 'block';
        }
    });

    // Agregar mano de obra
    document.getElementById('agregar-mano-obra').addEventListener('click', agregarManoObra);
    document.getElementById('mano-obra-descripcion').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') agregarManoObra();
    });
    document.getElementById('mano-obra-horas').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') agregarManoObra();
    });
    document.getElementById('mano-obra-precio').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') agregarManoObra();
    });

    // Actualizar totales cuando cambian descuentos o impuestos
    document.getElementById('descuento-porcentaje').addEventListener('input', actualizarTotales);
    document.getElementById('descuento-fijo').addEventListener('input', actualizarTotales);
    document.getElementById('impuesto-porcentaje').addEventListener('input', actualizarTotales);

    // Botones de acción
    document.getElementById('limpiar-presupuesto').addEventListener('click', limpiarPresupuesto);
    document.getElementById('exportar-pdf').addEventListener('click', exportarPDF);
}

// Agregar material con soporte de unidad/gramos/kilos
function agregarMaterial() {
    const descripcion = document.getElementById('material-descripcion').value.trim();
    const cantidad = parseFloat(document.getElementById('material-cantidad').value);
    const tipoUnidad = document.getElementById('material-tipo-unidad')?.value || 'unidad';
    const precioUnitario = parseFloat(document.getElementById('material-precio')?.value);
    const precioPor100g = parseFloat(document.getElementById('material-precio-unidad-peso')?.value);
    const precioPorKilo = parseFloat(document.getElementById('material-precio-kilo')?.value);

    if (!descripcion || isNaN(cantidad) || cantidad <= 0) {
        mostrarMensaje('Por favor, completa la descripción y cantidad correctamente', 'error');
        return;
    }

    let precio = 0;
    let unidad = 'unidad';
    let subtotal = 0;
    let precioPor100gValor = null;
    let precioPorKiloValor = null;

    if (tipoUnidad === 'gramos') {
        if (isNaN(precioPor100g) || precioPor100g < 0) {
            mostrarMensaje('Por favor, ingresa el precio por 100 gramos', 'error');
            return;
        }
        precio = precioPor100g / 100; // precio por gramo
        unidad = 'g';
        subtotal = cantidad * precio;
        precioPor100gValor = precioPor100g;
    } else if (tipoUnidad === 'kilos') {
        if (isNaN(precioPorKilo) || precioPorKilo < 0) {
            mostrarMensaje('Por favor, ingresa el precio por kilo', 'error');
            return;
        }
        precio = precioPorKilo; // precio por kilo
        unidad = 'kg';
        subtotal = cantidad * precio;
        precioPorKiloValor = precioPorKilo;
    } else {
        if (isNaN(precioUnitario) || precioUnitario < 0) {
            mostrarMensaje('Por favor, ingresa el precio unitario', 'error');
            return;
        }
        precio = precioUnitario;
        unidad = 'unidad';
        subtotal = cantidad * precio;
    }

    const material = {
        id: Date.now(),
        descripcion,
        cantidad,
        tipoUnidad,
        precio,
        precioPor100g: precioPor100gValor,
        precioPorKilo: precioPorKiloValor,
        unidad,
        subtotal
    };

    materiales.push(material);
    renderizarMateriales();
    actualizarTotales();

    // Limpiar campos
    document.getElementById('material-descripcion').value = '';
    document.getElementById('material-cantidad').value = '';
    if (document.getElementById('material-precio')) document.getElementById('material-precio').value = '';
    if (document.getElementById('material-precio-unidad-peso')) document.getElementById('material-precio-unidad-peso').value = '';
    if (document.getElementById('material-precio-kilo')) document.getElementById('material-precio-kilo').value = '';
    if (document.getElementById('material-tipo-unidad')) document.getElementById('material-tipo-unidad').value = 'unidad';
    // reset visibilidad
    const precioUnitarioEl = document.getElementById('material-precio');
    const precioPor100gEl = document.getElementById('material-precio-unidad-peso');
    const precioPorKiloEl = document.getElementById('material-precio-kilo');
    if (precioUnitarioEl) precioUnitarioEl.style.display = 'block';
    if (precioPor100gEl) precioPor100gEl.style.display = 'none';
    if (precioPorKiloEl) precioPorKiloEl.style.display = 'none';
    document.getElementById('material-descripcion').focus();
}

// Eliminar material
function eliminarMaterial(id) {
    materiales = materiales.filter(m => m.id !== id);
    renderizarMateriales();
    actualizarTotales();
}

// Renderizar materiales en la tabla
function renderizarMateriales() {
    const tbody = document.getElementById('materiales-tbody');
    tbody.innerHTML = '';

    materiales.forEach(material => {
        const tr = document.createElement('tr');
        let precioMostrar;
        let cantidadMostrar;
        
        if (material.tipoUnidad === 'gramos') {
            cantidadMostrar = `${formatearNumero(material.cantidad)} ${material.unidad}`;
            precioMostrar = material.precioPor100g ? `${formatearMoneda(material.precioPor100g)} / 100g` : formatearMoneda(material.precio);
        } else if (material.tipoUnidad === 'kilos') {
            cantidadMostrar = `${formatearNumero(material.cantidad)} ${material.unidad}`;
            precioMostrar = material.precioPorKilo ? `${formatearMoneda(material.precioPorKilo)} / kg` : formatearMoneda(material.precio);
        } else {
            cantidadMostrar = formatearNumero(material.cantidad);
            precioMostrar = formatearMoneda(material.precio);
        }
        
        tr.innerHTML = `
            <td>${material.descripcion}</td>
            <td>${cantidadMostrar}</td>
            <td>${material.unidad}</td>
            <td>${precioMostrar}</td>
            <td><strong>${formatearMoneda(material.subtotal)}</strong></td>
            <td><button class="btn btn-danger" onclick="eliminarMaterial(${material.id})">Eliminar</button></td>
        `;
        tbody.appendChild(tr);
    });

    // Actualizar subtotal
    const subtotal = materiales.reduce((sum, m) => sum + m.subtotal, 0);
    document.getElementById('subtotal-materiales').textContent = formatearMoneda(subtotal);
}

// Agregar mano de obra
function agregarManoObra() {
    const descripcion = document.getElementById('mano-obra-descripcion').value.trim();
    const horas = parseFloat(document.getElementById('mano-obra-horas').value);
    const precio = parseFloat(document.getElementById('mano-obra-precio').value);

    if (!descripcion || isNaN(horas) || horas <= 0 || isNaN(precio) || precio < 0) {
        mostrarMensaje('Por favor, completa todos los campos correctamente', 'error');
        return;
    }

    const trabajo = {
        id: Date.now(),
        descripcion,
        horas,
        precio,
        subtotal: horas * precio
    };

    manoObra.push(trabajo);
    renderizarManoObra();
    actualizarTotales();

    // Limpiar campos
    document.getElementById('mano-obra-descripcion').value = '';
    document.getElementById('mano-obra-horas').value = '';
    document.getElementById('mano-obra-precio').value = '';
    document.getElementById('mano-obra-descripcion').focus();
}

// Eliminar mano de obra
function eliminarManoObra(id) {
    manoObra = manoObra.filter(m => m.id !== id);
    renderizarManoObra();
    actualizarTotales();
}

// Renderizar mano de obra en la tabla
function renderizarManoObra() {
    const tbody = document.getElementById('mano-obra-tbody');
    tbody.innerHTML = '';

    manoObra.forEach(trabajo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${trabajo.descripcion}</td>
            <td>${formatearNumero(trabajo.horas)}</td>
            <td>${formatearMoneda(trabajo.precio)}</td>
            <td><strong>${formatearMoneda(trabajo.subtotal)}</strong></td>
            <td><button class="btn btn-danger" onclick="eliminarManoObra(${trabajo.id})">Eliminar</button></td>
        `;
        tbody.appendChild(tr);
    });

    // Actualizar subtotal
    const subtotal = manoObra.reduce((sum, m) => sum + m.subtotal, 0);
    document.getElementById('subtotal-mano-obra').textContent = formatearMoneda(subtotal);
}

// Actualizar totales
function actualizarTotales() {
    const subtotalMateriales = materiales.reduce((sum, m) => sum + m.subtotal, 0);
    const subtotalManoObra = manoObra.reduce((sum, m) => sum + m.subtotal, 0);
    const subtotal = subtotalMateriales + subtotalManoObra;

    // Descuentos
    const descuentoPorcentaje = parseFloat(document.getElementById('descuento-porcentaje').value) || 0;
    const descuentoFijo = parseFloat(document.getElementById('descuento-fijo').value) || 0;
    const descuentoPorcentajeValor = subtotal * (descuentoPorcentaje / 100);
    const descuentoTotal = descuentoPorcentajeValor + descuentoFijo;
    const subtotalConDescuento = Math.max(0, subtotal - descuentoTotal);

    // Impuestos
    const impuestoPorcentaje = parseFloat(document.getElementById('impuesto-porcentaje').value) || 0;
    const impuesto = subtotalConDescuento * (impuestoPorcentaje / 100);
    const total = subtotalConDescuento + impuesto;

    // Actualizar UI
    document.getElementById('resumen-materiales').textContent = formatearMoneda(subtotalMateriales);
    document.getElementById('resumen-mano-obra').textContent = formatearMoneda(subtotalManoObra);
    document.getElementById('resumen-subtotal').textContent = formatearMoneda(subtotal);

    // Mostrar/ocultar descuento
    const descuentoItem = document.getElementById('descuento-item');
    if (descuentoTotal > 0) {
        descuentoItem.style.display = 'flex';
        document.getElementById('resumen-descuento').textContent = `-${formatearMoneda(descuentoTotal)}`;
    } else {
        descuentoItem.style.display = 'none';
    }

    document.getElementById('impuesto-label').textContent = impuestoPorcentaje;
    document.getElementById('resumen-impuesto').textContent = formatearMoneda(impuesto);
    document.getElementById('resumen-total').innerHTML = `<strong>${formatearMoneda(total)}</strong>`;
}

// Formatear moneda
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(valor);
}

// Formatear número
function formatearNumero(valor) {
    return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

// Limpiar presupuesto
function limpiarPresupuesto() {
    if (confirm('¿Estás seguro de que quieres limpiar todo el presupuesto? Esta acción no se puede deshacer.')) {
        materiales = [];
        manoObra = [];
        renderizarMateriales();
        renderizarManoObra();
        
        // Limpiar formularios
        document.getElementById('numero-presupuesto').value = '';
        document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
        document.getElementById('validez').value = 30;
        document.getElementById('descripcion-importante').value = '';
        document.getElementById('descuento-porcentaje').value = 0;
        document.getElementById('descuento-fijo').value = 0;
        document.getElementById('impuesto-porcentaje').value = 21;
        document.getElementById('notas').value = '';
        
        actualizarTotales();
        mostrarMensaje('Presupuesto limpiado correctamente', 'success');
    }
}

// Cargar presupuesto guardado
function cargarPresupuestoGuardado() {
    const guardado = localStorage.getItem('presupuestoGuardado');
    if (guardado) {
        try {
            const presupuesto = JSON.parse(guardado);
            
            document.getElementById('numero-presupuesto').value = presupuesto.numero || '';
            document.getElementById('fecha').value = presupuesto.fecha || new Date().toISOString().split('T')[0];
            document.getElementById('validez').value = presupuesto.validez || 30;
            document.getElementById('descripcion-importante').value = presupuesto.descripcionImportante || '';
            document.getElementById('descuento-porcentaje').value = presupuesto.descuentoPorcentaje || 0;
            document.getElementById('descuento-fijo').value = presupuesto.descuentoFijo || 0;
            document.getElementById('impuesto-porcentaje').value = presupuesto.impuestoPorcentaje || 21;
            document.getElementById('notas').value = presupuesto.notas || '';
            
            materiales = presupuesto.materiales || [];
            manoObra = presupuesto.manoObra || [];
            
            renderizarMateriales();
            renderizarManoObra();
            actualizarTotales();
        } catch (e) {
            console.error('Error al cargar presupuesto guardado:', e);
        }
    }
}

// Exportar a PDF (reescrito completo)
function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configuración base
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // Paleta
    const primaryDark = [27, 60, 83]; // #1B3C53
    const primary = [35, 76, 106];    // #234C6A
    const secondary = [69, 104, 130]; // #456882

    // Helpers
    const addPageIfNeeded = (needed) => {
        if (yPos + needed > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
            return true;
        }
        return false;
    };

    const safeText = (value, fallback = '') => (value ? value : fallback);

    // Datos base
    const numeroPresupuesto = safeText(document.getElementById('numero-presupuesto').value, 'Sin número');
    const fechaRaw = safeText(document.getElementById('fecha').value, new Date().toISOString().split('T')[0]);
    const validez = parseInt(document.getElementById('validez').value, 10) || 30;
    const fechaFormateada = new Date(fechaRaw).toLocaleDateString('es-ES');
    const fechaVencimiento = new Date(new Date(fechaRaw).setDate(new Date(fechaRaw).getDate() + validez)).toLocaleDateString('es-ES');

    // Título
    doc.setFontSize(20);
    doc.setTextColor(...primaryDark);
    doc.setFont(undefined, 'bold');
    doc.text('PRESUPUESTO', pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;

    // Información del presupuesto
    doc.setFontSize(10);
    doc.setTextColor(...secondary);
    doc.setFont(undefined, 'normal');
    doc.text(`Número: ${numeroPresupuesto}`, margin, yPos);
    doc.text(`Fecha: ${fechaFormateada}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 6;
    doc.text(`Válido hasta: ${fechaVencimiento}`, margin, yPos);
    yPos += 10;

    // Información importante
    const descripcionImportante = safeText(document.getElementById('descripcion-importante').value.trim());
    if (descripcionImportante) {
        addPageIfNeeded(25);
        doc.setFontSize(12);
        doc.setTextColor(...primaryDark);
        doc.setFont(undefined, 'bold');
        doc.text('Información Importante:', margin, yPos);
        yPos += 6;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        const textoImportante = doc.splitTextToSize(descripcionImportante, pageWidth - 2 * margin);
        doc.text(textoImportante, margin, yPos);
        yPos += textoImportante.length * 5 + 6;
    }

    // Materiales
    if (materiales.length > 0) {
        addPageIfNeeded(30);
        doc.setFontSize(12);
        doc.setTextColor(...primaryDark);
        doc.setFont(undefined, 'bold');
        doc.text('Materiales:', margin, yPos);
        yPos += 8;

        const materialesData = materiales.map((m) => {
            let cantidadMostrar = formatearNumero(m.cantidad);
            let precioMostrar = formatearMoneda(m.precio);

            if (m.tipoUnidad === 'gramos') {
                cantidadMostrar = `${formatearNumero(m.cantidad)} ${m.unidad}`;
                precioMostrar = m.precioPor100g ? `${formatearMoneda(m.precioPor100g)} / 100g` : formatearMoneda(m.precio);
            } else if (m.tipoUnidad === 'kilos') {
                cantidadMostrar = `${formatearNumero(m.cantidad)} ${m.unidad}`;
                precioMostrar = m.precioPorKilo ? `${formatearMoneda(m.precioPorKilo)} / kg` : formatearMoneda(m.precio);
            }

            return [
                safeText(m.descripcion, 'Sin descripción'),
                cantidadMostrar,
                safeText(m.unidad, ''),
                precioMostrar,
                formatearMoneda(m.subtotal || 0)
            ];
        });

        doc.autoTable({
            startY: yPos,
            head: [['Descripción', 'Cantidad', 'Unidad', 'Precio Unit.', 'Subtotal']],
            body: materialesData,
            theme: 'striped',
            headStyles: { fillColor: primaryDark, textColor: [255, 255, 255] },
            styles: { fontSize: 9 },
            margin: { left: margin, right: margin }
        });

        yPos = doc.lastAutoTable.finalY + 6;
    }

    // Mano de obra
    if (manoObra.length > 0) {
        addPageIfNeeded(30);
        doc.setFontSize(12);
        doc.setTextColor(...primaryDark);
        doc.setFont(undefined, 'bold');
        doc.text('Mano de Obra:', margin, yPos);
        yPos += 8;

        const manoObraData = manoObra.map((m) => [
            safeText(m.descripcion, 'Sin descripción'),
            formatearNumero(m.horas),
            formatearMoneda(m.precio),
            formatearMoneda(m.subtotal || 0)
        ]);

        doc.autoTable({
            startY: yPos,
            head: [['Descripción', 'Horas', 'Precio/Hora', 'Subtotal']],
            body: manoObraData,
            theme: 'striped',
            headStyles: { fillColor: primaryDark, textColor: [255, 255, 255] },
            styles: { fontSize: 9 },
            margin: { left: margin, right: margin }
        });

        yPos = doc.lastAutoTable.finalY + 6;
    }

    // Resumen
    addPageIfNeeded(40);
    yPos += 4;
    doc.setFontSize(12);
    doc.setTextColor(...primaryDark);
    doc.setFont(undefined, 'bold');
    doc.text('Resumen:', margin, yPos);
    yPos += 8;

    const subtotalMateriales = materiales.reduce((sum, m) => sum + (m.subtotal || 0), 0);
    const subtotalManoObra = manoObra.reduce((sum, m) => sum + (m.subtotal || 0), 0);
    const subtotal = subtotalMateriales + subtotalManoObra;
    const descuentoPorcentaje = parseFloat(document.getElementById('descuento-porcentaje').value) || 0;
    const descuentoFijo = parseFloat(document.getElementById('descuento-fijo').value) || 0;
    const descuentoPorcentajeValor = subtotal * (descuentoPorcentaje / 100);
    const descuentoTotal = descuentoPorcentajeValor + descuentoFijo;
    const subtotalConDescuento = Math.max(0, subtotal - descuentoTotal);
    const impuestoPorcentaje = parseFloat(document.getElementById('impuesto-porcentaje').value) || 0;
    const impuesto = subtotalConDescuento * (impuestoPorcentaje / 100);
    const total = subtotalConDescuento + impuesto;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    doc.text(`Subtotal Materiales: ${formatearMoneda(subtotalMateriales)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 6;
    doc.text(`Subtotal Mano de Obra: ${formatearMoneda(subtotalManoObra)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 6;
    doc.text(`Subtotal: ${formatearMoneda(subtotal)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 6;

    if (descuentoTotal > 0) {
        doc.text(`Descuento: -${formatearMoneda(descuentoTotal)}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 6;
    }

    doc.text(`IVA/Impuesto (${impuestoPorcentaje}%): ${formatearMoneda(impuesto)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 8;

    doc.setFontSize(14);
    doc.setTextColor(...primaryDark);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: ${formatearMoneda(total)}`, pageWidth - margin, yPos, { align: 'right' });

    // Notas
    const notas = safeText(document.getElementById('notas').value.trim());
    if (notas) {
        addPageIfNeeded(30);
        yPos += 14;
        doc.setFontSize(12);
        doc.setTextColor(...primaryDark);
        doc.setFont(undefined, 'bold');
        doc.text('Notas y Observaciones:', margin, yPos);
        yPos += 6;
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        const textoNotas = doc.splitTextToSize(notas, pageWidth - 2 * margin);
        doc.text(textoNotas, margin, yPos);
    }

    // Descargar
    const nombreArchivo = `Presupuesto_${numeroPresupuesto || 'SinNumero'}_${fechaRaw.replace(/-/g, '')}.pdf`;
    doc.save(nombreArchivo);
    mostrarMensaje('PDF exportado correctamente', 'success');
}

// Mostrar mensaje
function mostrarMensaje(mensaje, tipo) {
    // Crear elemento de mensaje si no existe
    let mensajeEl = document.querySelector('.mensaje');
    if (!mensajeEl) {
        mensajeEl = document.createElement('div');
        mensajeEl.className = 'mensaje';
        document.querySelector('.container').insertBefore(mensajeEl, document.querySelector('.presupuesto-form'));
    }

    mensajeEl.textContent = mensaje;
    mensajeEl.className = `mensaje ${tipo} show`;

    setTimeout(() => {
        mensajeEl.classList.remove('show');
    }, 3000);
}

