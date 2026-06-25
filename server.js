const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Calculadora de Média - LPWI</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            background-color: #f4f4f9;
            color: #333;
        }
        h1, h2 {
            color: #444;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        form {
            margin-bottom: 30px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #fafafa;
        }
        .campo {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        input[type="text"], input[type="number"] {
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        input[type="submit"], input[type="reset"], button {
            padding: 10px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
        }
        input[type="submit"] {
            background-color: #28a745;
            color: white;
        }
        input[type="reset"] {
            background-color: #dc3545;
            color: white;
            margin-left: 10px;
        }
        button.btn-limpar {
            background-color: #ffc107;
            color: black;
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #007bff;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        .aprovado { color: green; font-weight: bold; }
        .exame { color: orange; font-weight: bold; }
        .reprovado { color: red; font-weight: bold; }
        
        #mensagem {
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 4px;
            display: none;
        }
        .msg-erro { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .msg-sucesso { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
    </style>
</head>
<body>

    <div class="container">
        <h1>Calculadora de Média Escolar</h1>
        
        <div id="mensagem"></div>

        <form id="meuFormulario" method="POST" action="/calcular">
            <div class="campo">
                <label for="id_aluno">Nome do Aluno:</label>
                <input type="text" name="aluno" id="id_aluno" required placeholder="Digite o nome do aluno">
            </div>

            <div class="campo">
                <label for="id_nota1">Nota do 1º Bimestre:</label>
                <input type="number" name="nota1" id="id_nota1" min="0" max="10" step="0.1" required placeholder="Ex: 7.5">
            </div>

            <div class="campo">
                <label for="id_nota2">Nota do 2º Bimestre:</label>
                <input type="number" name="nota2" id="id_nota2" min="0" max="10" step="0.1" required placeholder="Ex: 8.0">
            </div>

            <input type="submit" value="Calcular e Salvar">
            <input type="reset" value="Limpar Formulário">
        </form>

        <h2>Lista de Alunos Cadastrados</h2>
        <button class="btn-limpar" id="btnLimpar">Limpar Histórico Local</button>

        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Nota 1</th>
                    <th>Nota 2</th>
                    <th>Média</th>
                    <th>Situação</th>
                </tr>
            </thead>
            <tbody id="corpoTabela">
            </tbody>
        </table>
    </div>

    <script>
        let listaAlunos = [];

        const formulario = document.getElementById('meuFormulario');
        const corpoTabela = document.getElementById('corpoTabela');
        const btnLimpar = document.getElementById('btnLimpar');
        const divMensagem = document.getElementById('mensagem');

        function mostrarMensagem(texto, tipo) {
            divMensagem.textContent = texto;
            divMensagem.className = tipo === 'erro' ? 'msg-erro' : 'msg-sucesso';
            divMensagem.style.display = 'block';
            setTimeout(() => {
                divMensagem.style.display = 'none';
            }, 4000);
        }

        window.onload = function() {
            const dadosSalvos = localStorage.getItem('historico_alunos');
            if (dadosSalvos) {
                listaAlunos = JSON.parse(dadosSalvos);
                desenharTabela();
            }
        };

        formulario.onsubmit = async function(evento) {
            evento.preventDefault();

            const nome = document.getElementById('id_aluno').value;
            const n1 = document.getElementById('id_nota1').value;
            const n2 = document.getElementById('id_nota2').value;

            try {
                const resposta = await fetch('/calcular', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ aluno: nome, nota1: n1, nota2: n2 })
                });

                if (resposta.ok) {
                    const alunoCalculado = await resposta.json();

                    listaAlunos.push(alunoCalculado);
                    localStorage.setItem('historico_alunos', JSON.stringify(listaAlunos));

                    desenharTabela();
                    formulario.reset();
                    mostrarMensagem('Aluno cadastrado com sucesso!', 'sucesso');
                } else {
                    mostrarMensagem('Erro ao calcular notas no servidor.', 'erro');
                }
            } catch (erro) {
                mostrarMensagem('Erro na conexão com o servidor Express.', 'erro');
            }
        };

        function desenharTabela() {
            corpoTabela.innerHTML = '';

            listaAlunos.forEach(function(aluno) {
                let classeSituacao = '';
                if (aluno.situacao === 'Aprovado') classeSituacao = 'aprovado';
                else if (aluno.situacao === 'Exame Final') classeSituacao = 'exame';
                else classeSituacao = 'reprovado';

                const linha = document.createElement('tr');
                linha.innerHTML = \`
                    <td>\${aluno.nome}</td>
                    <td>\${aluno.nota1}</td>
                    <td>\${aluno.nota2}</td>
                    <td>\${aluno.media}</td>
                    <td class="\${classeSituacao}">\${aluno.situacao}</td>
                \`;
                corpoTabela.appendChild(linha);
            });
        }

        btnLimpar.onclick = function() {
            if (listaAlunos.length > 0) {
                listaAlunos = [];
                localStorage.removeItem('historico_alunos');
                desenharTabela();
                mostrarMensagem('Histórico local removido.', 'sucesso');
            }
        };
    </script>
</body>
</html>
    `);
});

app.post('/calcular', (req, res) => {
    const nome = req.body.aluno;
    const n1 = parseFloat(req.body.nota1);
    const n2 = parseFloat(req.body.nota2);

    const media = (n1 + n2) / 2;

    let situacao = '';
    if (media >= 6) {
        situacao = 'Aprovado';
    } else if (media >= 2) {
        situacao = 'Exame Final';
    } else {
        situacao = 'Reprovado';
    }

    res.json({
        nome: nome,
        nota1: n1,
        nota2: n2,
        media: media.toFixed(1),
        situacao: situacao
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});