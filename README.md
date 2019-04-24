# DeeApp

Aplicação com mapa interativo que permite analisar a distribuição espacial do erro.

Projecto desenvolvido no ambito:

1. Tese de Mestrado de Eduardo Lopes.

# Gitflow

Um gitflow estruturado permite uma implementação mais *limpa* e organizada do projecto. Esta secção mostra a estrutura de gitflow definida e adoptada neste projecto.


## Nova *issue*
	
As *issues* representam as tarefas que são para implementar. Cada issue pode ser marcada com 3 diferentes flags e são elas:

1. **Enhancement**: Representa uma nova *feature* na aplicação
2. **Bug**: Representa uma correção a uma *feature* existente

# Branchs #

## Main Branches ##

1. master - branch com projecto estável / entregas do projecto
2. development - branch para desenvolvimento e onde os issues branchs serão merged

Nestes branchs, não deve ser feito nenhum push direto. Ou seja, os pushs devem apenas representar merges de outros branchs.

## Issues Branches ##

Para cada issue deve ser criado um novo branch com a seguinte estrutura:

1. ISSUE#YYY_xxxxx
	
	- YYY: ID da issue criada
	- xxxxx: Breve descrição da tarefa 

### Commit message rule ###
	
Os commits no branch das **issues** devem representar pequenas adições/modificações de codigo e as mensagens devem ter a seguinte estrutura:

    [ID_ISSUE] Pequena descrição do que foi implementado

      Pequena descrição do que foi implementado
        - Mais detalhe 1
        - Mais detalhe 1

    URL: url_das_issues

### Pull Request ###

Quando a implementação da issue tevir terminada deve ser criado um pull request para o branch **development** com uma breve descrição da tarefe e alguns testes para validar a implementação.

Para fazer merge do pull request, este terá de ser aceite pelo reviewer. Para fazer o merge deve se seguir os seguintes passos:

1. Checkout para *father* branch (ex: git checkout development)
2. Merge o branch filho sem commit / push
    - git merge --no-ff --no-commit *child* branch
3. Commit o merge seguint o  **Commit Message Rules - PR**
4. Push alterações (ex: git push)
5. Remover o branch filho / issue
    - Localy: git branch -d child_branch_name
    - Remote: git push origin --delete child_branch_name

### **Commit Message Rule - PR**

    Merge branch 'XXXX' into YYYY

    URL: url_of_issues

    Signed-off-by: *name* of people that accept the PR
