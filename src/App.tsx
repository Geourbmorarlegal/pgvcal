import React, { useState, useEffect } from 'react';
import { Calculator, Building2, MapPin, Settings, FileText, DollarSign } from 'lucide-react';

interface CalculationResult {
  vvt: number;
  vve: number;
  vvi: number;
  details: {
    coeficienteUtilizacao: number;
    io: number;
    fct: number;
    fce: number;
    somaElementos: number;
  };
}

const valores = {
  poligono: {
    'central': 700.00,
    'medio-central': 560.00,
    'intermediario': 490.00,
    'medio-intermediario': 350.00,
    'intermediario-periferico': 245.00,
    'periferico': 140.00
  },
  edificacao: {
    'casa': 1042.00,
    'apartamento': 1142.00,
    'galpao': 404.00,
    'telheiro': 116.00,
    'loja': 942.00,
    'industria': 500.00,
    'outros': 1118.99
  },
  fatoresTerreno: {
    topografia: {
      'plano': 1.00,
      'aclive': 0.90,
      'declive': 0.80
    },
    situacao: {
      'uma-frente': 1.00,
      'esquina': 1.10,
      'encravado': 0.80
    },
    pedologia: {
      'normal': 1.00,
      'arenoso': 0.90,
      'rochoso': 0.80,
      'inundavel': 0.70,
      'alagado': 0.60
    }
  },
  fatoresEdificacao: {
    revestimento: {
      'sem-revestimento': 0,
      'oleo': 23,
      'caiacao': 17,
      'madeira': 12,
      'outros': 20
    },
    piso: {
      'terra-batida': 0,
      'cimento': 10,
      'ceramico': 17,
      'outros': 20
    },
    forro: {
      'inexistente': 0,
      'madeira': 3,
      'estuque': 3,
      'laje': 4
    },
    cobertura: {
      'palha': 3,
      'fibro': 6,
      'telha': 8,
      'laje': 10
    },
    sanitaria: {
      'inexistente': 0,
      'externa': 1,
      'interna': 2,
      'mais-uma': 3
    },
    estrutura: {
      'madeira': 11,
      'alvenaria': 18,
      'metalica': 26,
      'concreto': 28
    },
    eletrica: {
      'inexistente': 0,
      'aparente': 8,
      'embutida': 12
    },
    conservacao: {
      'bom': 1.00,
      'regular': 0.80,
      'mau': 0.50
    },
    posicao: {
      'isolada-alinhada': 0.90,
      'isolada-recuada': 1.00,
      'germinada-alinhada': 0.70,
      'germinada-recuada': 0.80,
      'superposta-alinhada': 0.80,
      'superposta-recuada': 0.90,
      'conjugada-alinhada': 0.80,
      'conjugada-recuada': 0.90
    }
  }
};

function App() {
  const [formData, setFormData] = useState({
    areaTerreno: '250',
    areaConstruida: '70',
    poligono: 'central',
    tipoEdificacao: 'casa',
    topografia: 'plano',
    situacao: 'uma-frente',
    pedologia: 'normal',
    revestimento: 'caiacao',
    piso: 'ceramico',
    forro: 'madeira',
    cobertura: 'telha',
    sanitaria: 'interna',
    estrutura: 'alvenaria',
    eletrica: 'embutida',
    conservacao: 'bom',
    posicao: 'isolada-recuada'
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateIPTU = () => {
    try {
      const areaTerreno = parseFloat(formData.areaTerreno) || 0;
      const areaConstruida = parseFloat(formData.areaConstruida) || 0;
      
      if (areaTerreno <= 0) {
        alert('Por favor, informe a área do terreno.');
        return;
      }

      const VBT = valores.poligono[formData.poligono as keyof typeof valores.poligono];
      const VBE = valores.edificacao[formData.tipoEdificacao as keyof typeof valores.edificacao];

      // Calcular Índice de Ociosidade (IO)
      const coeficienteUtilizacao = areaConstruida / areaTerreno;
      let IO;
      if (coeficienteUtilizacao <= 0.15) {
        IO = 1.00;
      } else if (coeficienteUtilizacao <= 0.30) {
        IO = 0.90;
      } else if (coeficienteUtilizacao <= 0.50) {
        IO = 0.80;
      } else {
        IO = 0.70;
      }

      // Calcular Fator Corretivo do Terreno (FCT)
      const topografia = valores.fatoresTerreno.topografia[formData.topografia as keyof typeof valores.fatoresTerreno.topografia];
      const situacao = valores.fatoresTerreno.situacao[formData.situacao as keyof typeof valores.fatoresTerreno.situacao];
      const pedologia = valores.fatoresTerreno.pedologia[formData.pedologia as keyof typeof valores.fatoresTerreno.pedologia];
      const FCT = topografia * situacao * pedologia;

      // Calcular Valor Venal do Terreno (VVT)
      const VVT = VBT * areaTerreno * IO * FCT;

      // Calcular Fator Corretivo da Edificação (FCE)
      let somaElementos = 0;
      somaElementos += valores.fatoresEdificacao.revestimento[formData.revestimento as keyof typeof valores.fatoresEdificacao.revestimento];
      somaElementos += valores.fatoresEdificacao.piso[formData.piso as keyof typeof valores.fatoresEdificacao.piso];
      somaElementos += valores.fatoresEdificacao.forro[formData.forro as keyof typeof valores.fatoresEdificacao.forro];
      somaElementos += valores.fatoresEdificacao.cobertura[formData.cobertura as keyof typeof valores.fatoresEdificacao.cobertura];
      somaElementos += valores.fatoresEdificacao.sanitaria[formData.sanitaria as keyof typeof valores.fatoresEdificacao.sanitaria];
      somaElementos += valores.fatoresEdificacao.estrutura[formData.estrutura as keyof typeof valores.fatoresEdificacao.estrutura];
      somaElementos += valores.fatoresEdificacao.eletrica[formData.eletrica as keyof typeof valores.fatoresEdificacao.eletrica];

      const conservacao = valores.fatoresEdificacao.conservacao[formData.conservacao as keyof typeof valores.fatoresEdificacao.conservacao];
      const posicao = valores.fatoresEdificacao.posicao[formData.posicao as keyof typeof valores.fatoresEdificacao.posicao];
      
      const FCE = (somaElementos / 100) * conservacao * posicao;

      // Calcular Valor Venal da Edificação (VVE)
      const VVE = areaConstruida > 0 ? VBE * areaConstruida * FCE : 0;

      // Calcular Valor Venal Total (VVI)
      const VVI = VVT + VVE;

      setResult({
        vvt: VVT,
        vve: VVE,
        vvi: VVI,
        details: {
          coeficienteUtilizacao,
          io: IO,
          fct: FCT,
          fce: FCE,
          somaElementos
        }
      });

      setShowDetails(true);
    } catch (error) {
      alert('Erro no cálculo. Verifique os dados informados.');
      console.error(error);
    }
  };

  useEffect(() => {
    calculateIPTU();
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      style: 'currency', 
      currency: 'BRL',
      minimumFractionDigits: 2 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-blue-600 text-white p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Calculadora IPTU</h1>
          </div>
          <p className="text-xl opacity-90">Planta Genérica de Valores - Marcolândia/PI</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 p-8">
          {/* Form Section */}
          <div className="space-y-8">
            {/* Dados do Imóvel */}
            <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-blue-500">
              <div className="flex items-center gap-2 mb-6">
                <Building2 className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800">Dados do Imóvel</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Área do Terreno (m²):
                  </label>
                  <input
                    type="number"
                    value={formData.areaTerreno}
                    onChange={(e) => handleInputChange('areaTerreno', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Ex: 250"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Área Construída (m²):
                  </label>
                  <input
                    type="number"
                    value={formData.areaConstruida}
                    onChange={(e) => handleInputChange('areaConstruida', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Ex: 70"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Localização (Polígono):
                  </label>
                  <select
                    value={formData.poligono}
                    onChange={(e) => handleInputChange('poligono', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="central">Central (R$ 700.00,00/m²)</option>
                    <option value="medio-central">Médio Central (R$ 560,00/m²)</option>
                    <option value="intermediario">Intermediário (R$ 490,00/m²)</option>
                    <option value="medio-intermediario">Médio-Intermediário (R$ 350,00/m²)</option>
                    <option value="intermediario-periferico">Intermediário-Periférico (R$ 245,00/m²)</option>
                    <option value="periferico">Periférico (R$ 140,00/m²)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tipo de Edificação:
                  </label>
                  <select
                    value={formData.tipoEdificacao}
                    onChange={(e) => handleInputChange('tipoEdificacao', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="casa">Casa (R$ 1.042,00/m²)</option>
                    <option value="apartamento">Apartamento (R$ 1.142,00/m²)</option>
                    <option value="galpao">Galpão (R$ 404,00/m²)</option>
                    <option value="telheiro">Telheiro (R$ 116,00/m²)</option>
                    <option value="loja">Loja (R$ 942,00/m²)</option>
                    <option value="industria">Indústria (R$ 500,00/m²)</option>
                    <option value="outros">Outros (R$ 1.118,99/m²)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Características do Terreno */}
            <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-green-500">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-800">Características do Terreno</h2>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Topografia:</label>
                  <select
                    value={formData.topografia}
                    onChange={(e) => handleInputChange('topografia', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="plano">Plano (1,00)</option>
                    <option value="aclive">Aclive (0,90)</option>
                    <option value="declive">Declive (0,80)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Situação:</label>
                  <select
                    value={formData.situacao}
                    onChange={(e) => handleInputChange('situacao', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="uma-frente">Uma Frente (1,00)</option>
                    <option value="esquina">Esquina/Duas Frentes (1,10)</option>
                    <option value="encravado">Encravado (0,80)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pedologia:</label>
                  <select
                    value={formData.pedologia}
                    onChange={(e) => handleInputChange('pedologia', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="normal">Normal (1,00)</option>
                    <option value="arenoso">Arenoso (0,90)</option>
                    <option value="rochoso">Rochoso (0,80)</option>
                    <option value="inundavel">Inundável (0,70)</option>
                    <option value="alagado">Alagado (0,60)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Características da Edificação */}
            <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-purple-500">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">Características da Edificação</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Revestimento Externo:</label>
                  <select
                    value={formData.revestimento}
                    onChange={(e) => handleInputChange('revestimento', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="sem-revestimento">Sem Revestimento (0%)</option>
                    <option value="oleo">Óleo (23%)</option>
                    <option value="caiacao">Caiação (17%)</option>
                    <option value="madeira">Madeira (12%)</option>
                    <option value="outros">Outros (20%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Piso:</label>
                  <select
                    value={formData.piso}
                    onChange={(e) => handleInputChange('piso', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="terra-batida">Terra Batida (0%)</option>
                    <option value="cimento">Cimento (10%)</option>
                    <option value="ceramico">Cerâmico/Mosaico (17%)</option>
                    <option value="outros">Outros (20%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Forro:</label>
                  <select
                    value={formData.forro}
                    onChange={(e) => handleInputChange('forro', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="inexistente">Inexistente (0%)</option>
                    <option value="madeira">Madeira (3%)</option>
                    <option value="estuque">Estuque (3%)</option>
                    <option value="laje">Laje (4%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cobertura:</label>
                  <select
                    value={formData.cobertura}
                    onChange={(e) => handleInputChange('cobertura', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="palha">Palha/Zinco/Cavaco (3%)</option>
                    <option value="fibro">Fibro/Cimento (6%)</option>
                    <option value="telha">Telha (8%)</option>
                    <option value="laje">Laje (10%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Instalação Sanitária:</label>
                  <select
                    value={formData.sanitaria}
                    onChange={(e) => handleInputChange('sanitaria', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="inexistente">Inexistente (0%)</option>
                    <option value="externa">Externa (1%)</option>
                    <option value="interna">Interna (2%)</option>
                    <option value="mais-uma">Mais de uma interna (3%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estrutura:</label>
                  <select
                    value={formData.estrutura}
                    onChange={(e) => handleInputChange('estrutura', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="madeira">Madeira (11%)</option>
                    <option value="alvenaria">Alvenaria (18%)</option>
                    <option value="metalica">Metálica (26%)</option>
                    <option value="concreto">Concreto (28%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Instalação Elétrica:</label>
                  <select
                    value={formData.eletrica}
                    onChange={(e) => handleInputChange('eletrica', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="inexistente">Inexistente (0%)</option>
                    <option value="aparente">Aparente (8%)</option>
                    <option value="embutida">Embutida (12%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estado de Conservação:</label>
                  <select
                    value={formData.conservacao}
                    onChange={(e) => handleInputChange('conservacao', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="bom">Bom (1,00)</option>
                    <option value="regular">Regular (0,80)</option>
                    <option value="mau">Mau (0,50)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Posição/Fachada:</label>
                  <select
                    value={formData.posicao}
                    onChange={(e) => handleInputChange('posicao', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <option value="isolada-alinhada">Isolada-alinhada (0,90)</option>
                    <option value="isolada-recuada">Isolada-recuada (1,00)</option>
                    <option value="germinada-alinhada">Germinada-alinhada (0,70)</option>
                    <option value="germinada-recuada">Germinada-recuada (0,80)</option>
                    <option value="superposta-alinhada">Superposta-alinhada (0,80)</option>
                    <option value="superposta-recuada">Superposta-recuada (0,90)</option>
                    <option value="conjugada-alinhada">Conjugada-alinhada (0,80)</option>
                    <option value="conjugada-recuada">Conjugada-recuada (0,90)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={calculateIPTU}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 text-lg"
            >
              <Calculator className="w-6 h-6" />
              Calcular Valor Venal
            </button>
          </div>

          {/* Results Section */}
          <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-red-500">
            <div className="flex items-center gap-2 mb-6">
              <DollarSign className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-red-700">Resultados do Cálculo</h2>
            </div>

            {result && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Valor Venal do Terreno (VVT):</span>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(result.vvt)}</span>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Valor Venal da Edificação (VVE):</span>
                  <span className="text-xl font-bold text-green-600">{formatCurrency(result.vve)}</span>
                </div>

                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-lg">Valor Venal Total (VVI):</span>
                    <span className="text-2xl font-bold">{formatCurrency(result.vvi)}</span>
                  </div>
                </div>

                {showDetails && (
                  <div className="bg-gray-100 p-6 rounded-xl mt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <h3 className="text-lg font-bold text-gray-800">Detalhes do Cálculo</h3>
                    </div>
                    
                    <div className="space-y-3 text-sm text-gray-700">
                      <div>
                        <p className="font-semibold">Cálculo do Terreno:</p>
                        <p>VVT = VBT × AT × IO × FCT</p>
                        <p>VVT = {valores.poligono[formData.poligono as keyof typeof valores.poligono].toFixed(2)} × {formData.areaTerreno} × {result.details.io.toFixed(2)} × {result.details.fct.toFixed(2)}</p>
                        <p>VVT = {formatCurrency(result.vvt)}</p>
                      </div>
                      
                      <div className="border-t pt-3">
                        <p className="font-semibold">Cálculo da Edificação:</p>
                        <p>Soma dos elementos: {result.details.somaElementos}%</p>
                        <p>FCE = ({result.details.somaElementos}/100) × {valores.fatoresEdificacao.conservacao[formData.conservacao as keyof typeof valores.fatoresEdificacao.conservacao].toFixed(2)} × {valores.fatoresEdificacao.posicao[formData.posicao as keyof typeof valores.fatoresEdificacao.posicao].toFixed(2)} = {result.details.fce.toFixed(2)}</p>
                        <p>VVE = VBE × AC × FCE</p>
                        <p>VVE = {valores.edificacao[formData.tipoEdificacao as keyof typeof valores.edificacao].toFixed(2)} × {formData.areaConstruida} × {result.details.fce.toFixed(2)}</p>
                        <p>VVE = {formatCurrency(result.vve)}</p>
                      </div>
                      
                      <div className="border-t pt-3">
                        <p className="font-semibold">Resultado Final:</p>
                        <p>VVI = VVT + VVE = {formatCurrency(result.vvt)} + {formatCurrency(result.vve)} = {formatCurrency(result.vvi)}</p>
                      </div>
                      
                      <div className="border-t pt-3">
                        <p className="font-semibold">Verificação dos Fatores:</p>
                        <p>Coeficiente de Utilização (AC/AT): {result.details.coeficienteUtilizacao.toFixed(4)}</p>
                        <p>Índice de Ociosidade (IO): {result.details.io.toFixed(2)}</p>
                        <p>Fator Corretivo Terreno (FCT): {result.details.fct.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
