import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  periodo: string;
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  receitas: any[];
  despesas: any[];
  contasPagar: any[];
  contasReceber: any[];
}

export default function RelatoriosPDF() {
  const { user } = useAuth();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tipoRelatorio, setTipoRelatorio] = useState<'mensal' | 'anual'>('mensal');
  const [mesAno, setMesAno] = useState(format(new Date(), 'yyyy-MM'));
  const [ano, setAno] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user) {
      loadReportData();
    }
  }, [user, tipoRelatorio, mesAno, ano]);

  const loadReportData = async () => {
    if (!user) return;

    setLoading(true);

    try {
      let startDate: Date;
      let endDate: Date;
      let periodo: string;

      if (tipoRelatorio === 'mensal') {
        const [year, month] = mesAno.split('-').map(Number);
        startDate = startOfMonth(new Date(year, month - 1));
        endDate = endOfMonth(new Date(year, month - 1));
        periodo = format(startDate, 'MMMM yyyy', { locale: ptBR });
      } else {
        startDate = startOfYear(new Date(ano, 0));
        endDate = endOfYear(new Date(ano, 0));
        periodo = ano.toString();
      }

      const [receitasRes, despesasRes, contasPagarRes, contasReceberRes] = await Promise.all([
        supabase
          .from('receitas')
          .select('*')
          .eq('user_id', user.id)
          .gte('data', format(startDate, 'yyyy-MM-dd'))
          .lte('data', format(endDate, 'yyyy-MM-dd'))
          .order('data', { ascending: false }),
        
        supabase
          .from('despesas')
          .select('*')
          .eq('user_id', user.id)
          .gte('data', format(startDate, 'yyyy-MM-dd'))
          .lte('data', format(endDate, 'yyyy-MM-dd'))
          .order('data', { ascending: false }),
        
        supabase
          .from('contas_pagar')
          .select('*')
          .eq('user_id', user.id)
          .gte('vencimento', format(startDate, 'yyyy-MM-dd'))
          .lte('vencimento', format(endDate, 'yyyy-MM-dd'))
          .order('vencimento', { ascending: false }),
        
        supabase
          .from('contas_receber')
          .select('*')
          .eq('user_id', user.id)
          .gte('vencimento', format(startDate, 'yyyy-MM-dd'))
          .lte('vencimento', format(endDate, 'yyyy-MM-dd'))
          .order('vencimento', { ascending: false})
      ]);

      const receitas = receitasRes.data || [];
      const despesas = despesasRes.data || [];
      const contasPagar = contasPagarRes.data || [];
      const contasReceber = contasReceberRes.data || [];

      const totalReceitas = receitas.reduce((acc, item) => acc + item.valor, 0);
      const totalDespesas = despesas.reduce((acc, item) => acc + item.valor, 0);

      setReportData({
        periodo,
        totalReceitas,
        totalDespesas,
        saldo: totalReceitas - totalDespesas,
        receitas,
        despesas,
        contasPagar,
        contasReceber
      });
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const generatePDF = async () => {
    if (!reportData || !user) return;

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Cores do brand
    const azulPrimario = [37, 99, 235]; // #2563eb
    const azulClaro = [219, 234, 254]; // #dbeafe
    const verde = [34, 197, 94]; // #22c55e
    const vermelho = [239, 68, 68]; // #ef4444

    // CABEÇALHO COM LOGO E BRAND
    pdf.setFillColor(...azulPrimario);
    pdf.rect(0, 0, pageWidth, 45, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('FinanceMEI', pageWidth / 2, 22, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Relatório ${tipoRelatorio === 'mensal' ? 'Mensal' : 'Anual'}`, pageWidth / 2, 32, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.text(reportData.periodo.toUpperCase(), pageWidth / 2, 39, { align: 'center' });

    yPosition = 55;

    // INFO DO USUÁRIO E DATA
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(9);
    pdf.text(`Usuário: ${user.nome}`, 20, yPosition);
    pdf.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`, pageWidth - 20, yPosition, { align: 'right' });
    
    yPosition += 15;

    // CARDS DE RESUMO
    const cardHeight = 25;
    const cardWidth = (pageWidth - 50) / 3;
    let cardX = 20;

    // Card Receitas
    pdf.setFillColor(34, 197, 94, 0.1);
    pdf.roundedRect(cardX, yPosition, cardWidth, cardHeight, 3, 3, 'F');
    pdf.setDrawColor(34, 197, 94);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(cardX, yPosition, cardWidth, cardHeight, 3, 3, 'S');
    
    pdf.setTextColor(34, 197, 94);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RECEITAS', cardX + cardWidth / 2, yPosition + 8, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text(formatCurrency(reportData.totalReceitas), cardX + cardWidth / 2, yPosition + 18, { align: 'center' });

    // Card Despesas
    cardX += cardWidth + 5;
    pdf.setFillColor(239, 68, 68, 0.1);
    pdf.roundedRect(cardX, yPosition, cardWidth, cardHeight, 3, 3, 'F');
    pdf.setDrawColor(239, 68, 68);
    pdf.roundedRect(cardX, yPosition, cardWidth, cardHeight, 3, 3, 'S');
    
    pdf.setTextColor(239, 68, 68);
    pdf.setFontSize(10);
    pdf.text('DESPESAS', cardX + cardWidth / 2, yPosition + 8, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text(formatCurrency(reportData.totalDespesas), cardX + cardWidth / 2, yPosition + 18, { align: 'center' });

    // Card Saldo
    cardX += cardWidth + 5;
    const saldoPositivo = reportData.saldo >= 0;
    const corSaldo = saldoPositivo ? [34, 197, 94] : [239, 68, 68];
    
    pdf.setFillColor(corSaldo[0], corSaldo[1], corSaldo[2], 0.1);
    pdf.roundedRect(cardX, yPosition, cardWidth, cardHeight, 3, 3, 'F');
    pdf.setDrawColor(...corSaldo);
    pdf.roundedRect(cardX, yPosition, cardWidth, cardHeight, 3, 3, 'S');
    
    pdf.setTextColor(...corSaldo);
    pdf.setFontSize(10);
    pdf.text('SALDO', cardX + cardWidth / 2, yPosition + 8, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.text(formatCurrency(reportData.saldo), cardX + cardWidth / 2, yPosition + 18, { align: 'center' });

    yPosition += 35;

    // TABELA DE RECEITAS
    if (reportData.receitas.length > 0) {
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Receitas', 20, yPosition);
      yPosition += 5;

      const receitasData = reportData.receitas.map(r => [
        format(new Date(r.data), 'dd/MM/yyyy'),
        r.descricao,
        r.categoria,
        formatCurrency(r.valor),
        r.recebido ? '✓ Recebido' : '○ Pendente'
      ]);

      autoTable(pdf, {
        startY: yPosition,
        head: [['Data', 'Descrição', 'Categoria', 'Valor', 'Status']],
        body: receitasData,
        theme: 'grid',
        headStyles: {
          fillColor: azulPrimario,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 10;
    }

    // TABELA DE DESPESAS
    if (reportData.despesas.length > 0) {
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Despesas', 20, yPosition);
      yPosition += 5;

      const despesasData = reportData.despesas.map(d => [
        format(new Date(d.data), 'dd/MM/yyyy'),
        d.descricao,
        d.categoria,
        formatCurrency(d.valor),
        d.pago ? '✓ Pago' : '○ Pendente'
      ]);

      autoTable(pdf, {
        startY: yPosition,
        head: [['Data', 'Descrição', 'Categoria', 'Valor', 'Status']],
        body: despesasData,
        theme: 'grid',
        headStyles: {
          fillColor: [239, 68, 68],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [50, 50, 50]
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { left: 20, right: 20 }
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 10;
    }

    // RODAPÉ
    const totalPages = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFillColor(...azulPrimario);
      pdf.rect(0, pdf.internal.pageSize.getHeight() - 15, pageWidth, 15, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(
        `FinanceMEI - Gestão Financeira para MEI | Página ${i} de ${totalPages}`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 7,
        { align: 'center' }
      );
    }

    // Salvar PDF
    pdf.save(`relatorio-${tipoRelatorio}-${reportData.periodo.replace(/\s/g, '-')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios em PDF</h1>
        <p className="text-gray-600">Gere relatórios profissionais das suas finanças</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Relatório
            </label>
            <select
              value={tipoRelatorio}
              onChange={(e) => setTipoRelatorio(e.target.value as 'mensal' | 'anual')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
            </select>
          </div>

          {tipoRelatorio === 'mensal' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mês/Ano
              </label>
              <input
                type="month"
                value={mesAno}
                onChange={(e) => setMesAno(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ano
              </label>
              <input
                type="number"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                min="2020"
                max="2030"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          )}

          <div className="flex items-end">
            <button
              onClick={generatePDF}
              disabled={loading || !reportData}
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i className="ri-file-pdf-line text-xl"></i>
              {loading ? 'Carregando...' : 'Gerar PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      {reportData && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Preview do Relatório</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm font-medium text-green-700 mb-1">Receitas</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(reportData.totalReceitas)}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-sm font-medium text-red-700 mb-1">Despesas</div>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(reportData.totalDespesas)}</div>
            </div>
            <div className={`${reportData.saldo >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4`}>
              <div className={`text-sm font-medium ${reportData.saldo >= 0 ? 'text-blue-700' : 'text-orange-700'} mb-1`}>Saldo</div>
              <div className={`text-2xl font-bold ${reportData.saldo >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>{formatCurrency(reportData.saldo)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Receitas</div>
              <div className="text-xl font-bold text-gray-900">{reportData.receitas.length}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Despesas</div>
              <div className="text-xl font-bold text-gray-900">{reportData.despesas.length}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Contas a Pagar</div>
              <div className="text-xl font-bold text-gray-900">{reportData.contasPagar.length}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Contas a Receber</div>
              <div className="text-xl font-bold text-gray-900">{reportData.contasReceber.length}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
