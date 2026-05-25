import jsPDF from 'jspdf';

export const generateClinicalReport = async (userData: any, evaluations: any[]) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229); // Primary color
  doc.text('Reporte de Bienestar Mental - MindGuard', 20, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generado el: ${date}`, 20, 30);
  doc.text(`Paciente: ${userData.nombre} (${userData.email})`, 20, 35);
  
  doc.setDrawColor(226, 232, 240);
  doc.line(20, 40, 190, 40);

  // Summary Table
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('Resumen de Evaluaciones Recientes', 20, 55);

  let yPos = 65;
  doc.setFontSize(10);
  doc.setFillColor(248, 250, 252);
  doc.rect(20, yPos, 170, 10, 'F');
  doc.text('Fecha', 25, yPos + 7);
  doc.text('PHQ-9', 60, yPos + 7);
  doc.text('GAD-7', 90, yPos + 7);
  doc.text('Nivel de Riesgo', 120, yPos + 7);
  
  yPos += 15;
  evaluations.slice().reverse().forEach((ev) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(new Date(ev.fecha).toLocaleDateString(), 25, yPos);
    doc.text(ev.phq9Score.toString(), 60, yPos);
    doc.text(ev.gad7Score.toString(), 90, yPos);
    doc.text(ev.nivelRiesgo, 120, yPos);
    yPos += 10;
  });

  // Clinical Notice
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const notice = 'AVISO: Este reporte es una herramienta de monitoreo basada en inteligencia artificial y autoevaluacion. No constituye un diagnóstico médico. Consulte con un profesional de la salud mental titulado.';
  doc.text(notice, 20, 285, { maxWidth: 170 });

  doc.save(`Reporte_MindGuard_${userData.nombre.replace(' ', '_')}.pdf`);
};
