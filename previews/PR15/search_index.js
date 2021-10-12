var documenterSearchIndex = {"docs":
[{"location":"algorithm/#Algorithm","page":"Algorithm","title":"Algorithm","text":"","category":"section"},{"location":"algorithm/","page":"Algorithm","title":"Algorithm","text":"using JuliaFormatter: format_text\nusing MacroTools: prettify\nusing Markdown\n\nmacro prettyexpand(exp)\n    s = format_text(string(\n        prettify(macroexpand(@__MODULE__, exp))\n    ), margin = 80)\n\n    Markdown.parse(\"\"\"\n    ```julia\n    $s\n    ```\n    \"\"\")\nend","category":"page"},{"location":"algorithm/","page":"Algorithm","title":"Algorithm","text":"using DataFrameMacros\n\n@prettyexpand @select(df, :z = :x + :y)","category":"page"},{"location":"algorithm/","page":"Algorithm","title":"Algorithm","text":"@prettyexpand @select(df, :z = @c :x .+ :y)","category":"page"},{"location":"algorithm/","page":"Algorithm","title":"Algorithm","text":"@prettyexpand @select(df, :z = $1 + $2)","category":"page"},{"location":"algorithm/","page":"Algorithm","title":"Algorithm","text":"@prettyexpand @select(df, :z = @m :x + :y)","category":"page"},{"location":"algorithm/","page":"Algorithm","title":"Algorithm","text":"@prettyexpand @transform(df, @t :first_name, :last_name = split(:full_name))","category":"page"},{"location":"#DataFrameMacros.jl","page":"DataFrameMacros.jl","title":"DataFrameMacros.jl","text":"","category":"section"},{"location":"","page":"DataFrameMacros.jl","title":"DataFrameMacros.jl","text":"DataFrameMacros.jl offers macros for DataFrame manipulation with a syntax geared towards clarity, brevity and convenience. Each macro translates expressions into the more verbose source => function => sink mini-language from DataFrames.jl.","category":"page"},{"location":"","page":"DataFrameMacros.jl","title":"DataFrameMacros.jl","text":"Here is a simple example:","category":"page"},{"location":"","page":"DataFrameMacros.jl","title":"DataFrameMacros.jl","text":"using DataFrameMacros, DataFrames\ndf = DataFrame(name = [\"Mary Louise Parker\", \"Thomas John Fisher\"])\n\nresult = @transform(df, :middle_initial = split(:name)[2][1] * \".\")","category":"page"},{"location":"","page":"DataFrameMacros.jl","title":"DataFrameMacros.jl","text":"Unlike DataFrames.jl, most operations are row-wise by default. This often results in cleaner code that's easier to understand and reason about, especially when string or object manipulation is involved. Such operations often don't have a clean broadcasting syntax, for example, somestring[2] is easier to read than getindex.(somestrings, 2). The same is true for someobject.property and getproperty.(someobjects, :property).","category":"page"},{"location":"","page":"DataFrameMacros.jl","title":"DataFrameMacros.jl","text":"The following macros are currently available:","category":"page"},{"location":"","page":"DataFrameMacros.jl","title":"DataFrameMacros.jl","text":"@transform / @transform!\n@select / @select!\n@groupby\n@combine\n@subset / @subset!\n@sort / @sort!\n@unique","category":"page"},{"location":"","page":"DataFrameMacros.jl","title":"DataFrameMacros.jl","text":"Together with Chain.jl, you get a convient syntax for chains of transformations:","category":"page"},{"location":"","page":"DataFrameMacros.jl","title":"DataFrameMacros.jl","text":"using DataFrameMacros\nusing DataFrames\nusing Chain\nusing Random\nusing Statistics\nRandom.seed!(123)\n\ndf = DataFrame(\n    id = shuffle(1:5),\n    group = rand('a':'b', 5),\n    weight_kg = randn(5) .* 5 .+ 60,\n    height_cm = randn(5) .* 10 .+ 170)\n\nresult = @chain df begin\n    @subset(:weight_kg > 50)\n    @transform(:BMI = :weight_kg / (:height_cm / 100) ^ 2)\n    @groupby(iseven(:id), :group)\n    @combine(:mean_BMI = mean(:BMI))\n    @sort(sqrt(:mean_BMI))\nend\n\nshow(result)","category":"page"},{"location":"#Design-choices","page":"DataFrameMacros.jl","title":"Design choices","text":"","category":"section"},{"location":"","page":"DataFrameMacros.jl","title":"DataFrameMacros.jl","text":"These are the most important aspects that differ from other packages (DataFramesMeta.jl in particular):","category":"page"},{"location":"","page":"DataFrameMacros.jl","title":"DataFrameMacros.jl","text":"All macros except @combine work row-wise by default. This reduces syntax complexity in most cases because no broadcasting is necessary. A flag macro (@c or @r) can be used to switch between row/column-based mode when needed.\n@groupby and @sort allow using arbitrary expressions including multiple columns, without having to @transform first and repeat the new column names.\nColumn expressions are interpolated into the macro with $. All column expressions are broadcasted implicitly to create a collection of src-func-sink pairs. This allows to use multi-column specifiers like All() or Not(:x) where the specified transformation is executed for each column.\nKeyword arguments to the macro-underlying functions work by separating them from column expressions with the ; character.\nTarget column names are written with : symbols to avoid visual ambiguity (:newcol = ...). This also allows to use AsTable as a target like in DataFrames.jl.\nThe flag macro can also include the character m to switch on automatic passmissing in row-wise mode.\nThere is also a @t flag macro, which extracts every :sym = expression expression and collects the new symbols in a named tuple, while setting the target to AsTable.","category":"page"},{"location":"documentation/#Documentation","page":"Documentation","title":"Documentation","text":"","category":"section"},{"location":"documentation/","page":"Documentation","title":"Documentation","text":"Modules = [DataFrameMacros]","category":"page"},{"location":"documentation/#DataFrameMacros.DataFrameMacros","page":"Documentation","title":"DataFrameMacros.DataFrameMacros","text":"DataFrameMacros offers macros which transform expressions for DataFrames functions that use the source => function => sink mini-language. The supported functions are @transform/@transform!, @select/@select!, @groupby, @combine, @subset/@subset!, @sort/@sort! and @unique.\n\nAll macros have signatures of the form:\n\n@macro(df, args...; kwargs...)\n\nEach positional argument in args is converted to a source .=> function .=> sink expression for the transformation mini-language of DataFrames. By default, all macros execute the given function by-row, only @combine executes by-column. There is automatic broadcasting across all column specifiers, so it is possible to directly use multi-column specifiers such as All(), Not(:x), r\"columnname\" and startswith(\"prefix\").\n\nFor example, the following pairs of expressions are equivalent:\n\ntransform(df, :x .=> ByRow(x -> x + 1) .=> :y)\n@transform(df, :y = :x + 1)\n\nselect(df, names(df, All()) .=> ByRow(x -> x ^ 2))\n@select(df, $(All()) ^ 2)\n\ncombine(df, :x .=> (x -> sum(x) / 5) .=> :result)\n@combine(df, :result = sum(:x) / 5)\n\nColumn references\n\nEach positional argument must be of the form [sink =] some_expression. Columns can be referenced within sink or some_expression using a Symbol, a String, or an Int. Any column identifier that is not a Symbol must be prefaced with the interpolation symbol $. The $ interpolation symbol also allows to use variables or expressions that evaluate to column identifiers.\n\nThe five expressions in the following code block are equivalent.\n\nusing DataFrames\nusing DataFrameMacros\n\ndf = DataFrame(x = 1:3)\n\n@transform(df, :y = :x + 1)\n@transform(df, :y = $\"x\" + 1)\n@transform(df, :y = $1 + 1)\ncol = :x\n@transform(df, :y = $col + 1)\ncols = [:x, :y, :z]\n@transform(df, :y = $(cols[1]) + 1)\n\nPassing multiple expressions\n\nMultiple expressions can be passed as multiple positional arguments, or alternatively as separate lines in a begin end block. You can use parentheses, or omit them. The following expressions are equivalent:\n\n@transform(df, :y = :x + 1, :z = :x * 2)\n@transform df :y = :x + 1 :z = :x * 2\n@transform df begin\n    :y = :x + 1\n    :z = :x * 2\nend\n@transform(df, begin\n    :y = :x + 1\n    :z = :x * 2\nend)\n\nFlag macros\n\nYou can modify the behavior of all macros using flag macros, which are not real macros but only signal changed behavior for a positional argument to the outer macro.\n\nEach flag is specified with a single character, and you can combine these characters as well. The supported flags are:\n\ncharacter meaning\nr Switch to by-row processing.\nc Switch to by-column processing.\nm Wrap the function expression in passmissing.\nt Collect all :symbol = expression expressions into a NamedTuple where (; symbol = expression, ...) and set the sink to AsTable.\n\nExample @c\n\nTo compute a centered column with @transform, you need access to the whole column at once and signal this with the @c flag.\n\nusing Statistics\nusing DataFrames\nusing DataFrameMacros\n\njulia> df = DataFrame(x = 1:3)\n3×1 DataFrame\n Row │ x     \n     │ Int64 \n─────┼───────\n   1 │     1\n   2 │     2\n   3 │     3\n\njulia> @transform(df, :x_centered = @c :x .- mean(:x))\n3×2 DataFrame\n Row │ x      x_centered \n     │ Int64  Float64    \n─────┼───────────────────\n   1 │     1        -1.0\n   2 │     2         0.0\n   3 │     3         1.0\n\nExample @m\n\nMany functions need to be wrapped in passmissing to correctly return missing if any input is missing. This can be achieved with the @m flag macro.\n\njulia> df = DataFrame(name = [\"alice\", \"bob\", missing])\n3×1 DataFrame\n Row │ name    \n     │ String? \n─────┼─────────\n   1 │ alice\n   2 │ bob\n   3 │ missing \n\njulia> @transform(df, :name_upper = @m uppercasefirst(:name))\n3×2 DataFrame\n Row │ name     name_upper \n     │ String?  String?    \n─────┼─────────────────────\n   1 │ alice    Alice\n   2 │ bob      Bob\n   3 │ missing  missing    \n\nExample @t\n\nIn DataFrames, you can return a NamedTuple from a function and then automatically expand it into separate columns by using AsTable as the sink value. To simplify this process, you can use the @t flag macro, which collects all statements of the form :symbol = expression in the function body, collects them into a NamedTuple, and sets the sink argument to AsTable.\n\njulia> df = DataFrame(name = [\"Alice Smith\", \"Bob Miller\"])\n2×1 DataFrame\n Row │ name        \n     │ String      \n─────┼─────────────\n   1 │ Alice Smith\n   2 │ Bob Miller\n\njulia> @transform(df, @t begin\n           s = split(:name)\n           :first_name = s[1]\n           :last_name = s[2]\n       end)\n2×3 DataFrame\n Row │ name         first_name  last_name  \n     │ String       SubString…  SubString… \n─────┼─────────────────────────────────────\n   1 │ Alice Smith  Alice       Smith\n   2 │ Bob Miller   Bob         Miller\n\nThe @t flag also works with tuple destructuring syntax, so the previous example can be shortened to:\n\n@transform(df, @t :first_name, :last_name = split(:name))\n\n\n\n\n\n","category":"module"},{"location":"documentation/#DataFrameMacros.@combine-Tuple","page":"Documentation","title":"DataFrameMacros.@combine","text":"@combine(df, args...; kwargs...)\n\nThe @combine macro builds a DataFrames.combine call. Each expression in args is converted to a src => function => sink construct that conforms to the transformation mini-language of DataFrames.\n\nKeyword arguments kwargs are passed down to combine but have to be separated from the positional arguments by a semicolon ;.\n\nThe transformation logic for all DataFrameMacros macros is explained in the DataFrameMacros module docstring, accessible via ?DataFrameMacros.\n\n\n\n\n\n","category":"macro"},{"location":"documentation/#DataFrameMacros.@select!-Tuple","page":"Documentation","title":"DataFrameMacros.@select!","text":"@select!(df, args...; kwargs...)\n\nThe @select! macro builds a DataFrames.select! call. Each expression in args is converted to a src => function => sink construct that conforms to the transformation mini-language of DataFrames.\n\nKeyword arguments kwargs are passed down to select! but have to be separated from the positional arguments by a semicolon ;.\n\nThe transformation logic for all DataFrameMacros macros is explained in the DataFrameMacros module docstring, accessible via ?DataFrameMacros.\n\n\n\n\n\n","category":"macro"},{"location":"documentation/#DataFrameMacros.@select-Tuple","page":"Documentation","title":"DataFrameMacros.@select","text":"@select(df, args...; kwargs...)\n\nThe @select macro builds a DataFrames.select call. Each expression in args is converted to a src => function => sink construct that conforms to the transformation mini-language of DataFrames.\n\nKeyword arguments kwargs are passed down to select but have to be separated from the positional arguments by a semicolon ;.\n\nThe transformation logic for all DataFrameMacros macros is explained in the DataFrameMacros module docstring, accessible via ?DataFrameMacros.\n\n\n\n\n\n","category":"macro"},{"location":"documentation/#DataFrameMacros.@subset!-Tuple","page":"Documentation","title":"DataFrameMacros.@subset!","text":"@subset!(df, args...; kwargs...)\n\nThe @subset! macro builds a DataFrames.subset! call. Each expression in args is converted to a src => function => sink construct that conforms to the transformation mini-language of DataFrames.\n\nKeyword arguments kwargs are passed down to subset! but have to be separated from the positional arguments by a semicolon ;.\n\nThe transformation logic for all DataFrameMacros macros is explained in the DataFrameMacros module docstring, accessible via ?DataFrameMacros.\n\n\n\n\n\n","category":"macro"},{"location":"documentation/#DataFrameMacros.@subset-Tuple","page":"Documentation","title":"DataFrameMacros.@subset","text":"@subset(df, args...; kwargs...)\n\nThe @subset macro builds a DataFrames.subset call. Each expression in args is converted to a src => function => sink construct that conforms to the transformation mini-language of DataFrames.\n\nKeyword arguments kwargs are passed down to subset but have to be separated from the positional arguments by a semicolon ;.\n\nThe transformation logic for all DataFrameMacros macros is explained in the DataFrameMacros module docstring, accessible via ?DataFrameMacros.\n\n\n\n\n\n","category":"macro"},{"location":"documentation/#DataFrameMacros.@transform!-Tuple","page":"Documentation","title":"DataFrameMacros.@transform!","text":"@transform!(df, args...; kwargs...)\n\nThe @transform! macro builds a DataFrames.transform! call. Each expression in args is converted to a src => function => sink construct that conforms to the transformation mini-language of DataFrames.\n\nKeyword arguments kwargs are passed down to transform! but have to be separated from the positional arguments by a semicolon ;.\n\nThe transformation logic for all DataFrameMacros macros is explained in the DataFrameMacros module docstring, accessible via ?DataFrameMacros.\n\n\n\n\n\n","category":"macro"},{"location":"documentation/#DataFrameMacros.@transform-Tuple","page":"Documentation","title":"DataFrameMacros.@transform","text":"@transform(df, args...; kwargs...)\n\nThe @transform macro builds a DataFrames.transform call. Each expression in args is converted to a src => function => sink construct that conforms to the transformation mini-language of DataFrames.\n\nKeyword arguments kwargs are passed down to transform but have to be separated from the positional arguments by a semicolon ;.\n\nThe transformation logic for all DataFrameMacros macros is explained in the DataFrameMacros module docstring, accessible via ?DataFrameMacros.\n\n\n\n\n\n","category":"macro"},{"location":"documentation/#DataFrameMacros.@unique-Tuple","page":"Documentation","title":"DataFrameMacros.@unique","text":"@unique(df, args...; kwargs...)\n\nThe @unique macro builds a DataFrames.unique call. Each expression in args is converted to a src => function => sink construct that conforms to the transformation mini-language of DataFrames.\n\nKeyword arguments kwargs are passed down to unique but have to be separated from the positional arguments by a semicolon ;.\n\nThe transformation logic for all DataFrameMacros macros is explained in the DataFrameMacros module docstring, accessible via ?DataFrameMacros.\n\n\n\n\n\n","category":"macro"},{"location":"tutorial/#Tutorial","page":"Tutorial","title":"Tutorial","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"ENV[\"COLUMNS\"] = 200\nENV[\"LINES\"] = 16","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"In this tutorial, we'll get to know the macros of DataFrameMacros while working with the well-known Titanic dataset from Kaggle.","category":"page"},{"location":"tutorial/#Loading-the-data","page":"Tutorial","title":"Loading the data","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"The titanic function returns the DataFrame with data about passengers of the Titanic.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"using DataFrameMacros, DataFrames, Statistics\n\ndf = DataFrameMacros.titanic()","category":"page"},{"location":"tutorial/#@select","page":"Tutorial","title":"@select","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"The simplest operation one can do is to select columns from a DataFrame. DataFrames.jl has the select function for that purpose and DataFramesMacro has the corresponding @select macro. We can pass symbols or strings with column names that we're interested in.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@select(df, :Name, :Age, :Survived)","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"We can also compute new columns with @select. We can either specify a new column ourselves, or DataFrames selects an automatic name.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"For example, we can extract the last name from each name string by splitting at the comma.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@select(df, :last_name = split(:Name, \",\")[1])","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"The split function operates on a single string, so for this expression to work on the whole column :Name, there must be an implicit broadcast expansion happening. In DataFrameMacros, every macro but @combine works by-row by default. The expression that the @select macro creates is equivalent to the following ByRow construct:","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"select(df, :Name => ByRow(x -> split(x, \",\")[1]) => :last_name)","category":"page"},{"location":"tutorial/#@transform","page":"Tutorial","title":"@transform","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"Another thing we can try is to categorize every passenger into child or adult at the boundary of 18 years.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"Let's use the @transform macro this time, which appends new columns to an existing DataFrame.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@transform(df, :type = :Age >= 18 ? \"adult\" : \"child\")","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"This command fails because some passengers have no age recorded, and the ternary operator ... ? ... : ... (a shortcut for if ... then ... else ...) cannot operate on missing values.","category":"page"},{"location":"tutorial/#The-@m-passmissing-flag-macro","page":"Tutorial","title":"The @m passmissing flag macro","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"One option is to remove the missing values beforehand, but then we would have to delete rows from the dataset. A simple option to make the expression pass through missing values, is by using the special flag macro @m.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@transform(df, :type = @m :Age >= 18 ? \"adult\" : \"child\")","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"This is equivalent to a DataFrames construct, in which the function is wrapped in passmissing:","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"transform(df, :Age => ByRow(passmissing(x -> x >= 18 ? \"adult\" : \"child\")) => :type)","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"This way, if any input argument is missing, the function returns missing, too.","category":"page"},{"location":"tutorial/#@subset","page":"Tutorial","title":"@subset","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"To retain only rows that fulfill certain conditions, you can use the @subset macro. For this macro it does not make sense to specify sink column names, because derived columns do not appear in the result. If there are missing values, you can use the @m flag to pass them through the boolean condition, and add the keyword argument skipmissing = true which the underlying subset function requires to remove such rows.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@subset(df, @m startswith(:Name, \"M\") && :Age > 50; skipmissing = true)","category":"page"},{"location":"tutorial/#@groupby","page":"Tutorial","title":"@groupby","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"The groupby function in DataFrames does not use the src => function => sink mini-language, it requires you to create any columns you want to group by beforehand. In DataFrameMacros, the @groupby macro works like a transform and groupby combination, so that you can create columns and group by them in one stroke.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"For example, we could group the passengers based on if their last name begins with a letter from the first or the second half of the alphabet.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@groupby(df, :alphabet_half = :Name[1] <= 'M' ? \"first\" : \"second\")","category":"page"},{"location":"tutorial/#begin-...-end-syntax","page":"Tutorial","title":"begin ... end syntax","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"You can of course group by multiple columns, in that case just add more positional arguments. In order to write more readable code, we can arrange our multiple arguments as lines in a begin ... end block instead of two comma-separated positional arguments.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"group = @groupby df begin\n    :alphabet_half = :Name[1] <= 'M' ? \"first\" : \"second\"\n    :Sex\nend","category":"page"},{"location":"tutorial/#@combine","page":"Tutorial","title":"@combine","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"We can compute summary statistics on groups using the @combine macro. This is the only macro that works by-column by default because aggregations are most commonly computed on full columns, not on each row.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"For example, we can compute survival rates for the groups we created above.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@combine(group, :survival_rate = mean(:Survived))","category":"page"},{"location":"tutorial/#@chain","page":"Tutorial","title":"@chain","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"The @chain macro from Chain.jl is useful to build sequences of operations. It is not included in DataFrameMacros but works well with it.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"In a chain, the first argument of each function or macro call is by default the result from the previous line.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"using Chain\n\n@chain df begin\n    @select(:Sex, :Age, :Survived)\n    dropmissing(:Age)\n    @groupby(:Sex, :age_range =\n        floor(Int, :Age/10) * 10 : ceil(Int, :Age/10) * 10 - 1)\n    @combine(:survival_rate = mean(:Survived))\n    @sort(first(:age_range), :Sex)\nend","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"Here you could also see the @sort macro, which is useful when you want to sort by values that are derived from different columns, but which you don't want to include in the DataFrame.","category":"page"},{"location":"tutorial/#The-@c-flag-macro","page":"Tutorial","title":"The @c flag macro","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"Some @transform or @select calls require access to whole columns at once. One scenario is computing a z-score. Because @transform and @select work by-row by default, you need to add the @c flag macro to signal that you want to work by-column. This is exactly the opposite from DataFrames, where you work by-column by default and signal by-row behavior with the ByRow wrapper.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@select(\n    dropmissing(df, :Age),\n    :age_z = @c (:Age .- mean(:Age)) ./ std(:Age))","category":"page"},{"location":"tutorial/#The-@t-flag-macro","page":"Tutorial","title":"The @t flag macro","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"If a computation should return multiple different columns, DataFrames allows you to do this by returning a NamedTuple and setting the sink argument to AsTable. To streamline this process you can use the @t flag macro. It signals that all :symbol = expression expressions that are found are rewritten so that a NamedTuple like (symbol = expression, symbol2...) is returned and the sink argument is set to AsTable.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@select(df, @t begin\n    nameparts = split(:Name, r\"[\\s,]+\")\n    :title = nameparts[2]\n    :first_name = nameparts[3]\n    :last_name = nameparts[1]\nend)","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"You can also use tuple destructuring syntax with the @t macro. This can often make assignments of multiple columns even more terse:","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@select(df, @t begin\n    :last_name, :title, :first_name, rest... = split(:Name, r\"[\\s,]+\")\nend)","category":"page"},{"location":"tutorial/#Multi-column-specifications","page":"Tutorial","title":"Multi-column specifications","text":"","category":"section"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"So far we have only accessed a single column with each column specifier, like :Survived. But often, transformations are supposed to be applied over a set of columns.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"In DataFrameMacros, the source-function-sink pair construct being created is automatically broadcasted over all column specifiers. This means one can not only use any expression marked by $ which results in a single column identifier, but also in multi column identifiers. The broadcasting is \"invisible\" to the user when they only limit their use to single-column identifiers, as broadcasting over singular objects results in a singular source-function-sink expression.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"Possible identifiers are n-dimensional arrays of strings, symbols or integers and all valid inputs to the DataFrames.names(df, specifier) function. Examples of these are All(), Not(:x), Between(:x, :z), any Type, or any Function that returns true or false given a column name String.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"Let's look at a few basic examples. Here's a simple selection of columns without transformation:","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@select(df, $(Between(:Name, :Age)))","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"Or another example with a Function that selects all columns ending with \"e\":","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@select(df, $(endswith(\"e\")))","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"The next step is to actually compute with the selected columns. The resulting DataFrames mini-language construct is sources .=> function[s] .=> sinks where in the default case, there is just a single function, even when using multiple columns.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"For example, we can select all columns that are subtypes of Real and convert them to Float32:","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@select(df, Float32($Real))","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"On the left-hand side of left_expression = right_expression, we can also create a multi-column-specifier object in order to choose a collection of column names for the result of right_expression. We can splice collections of existing names in with $ which makes it easy to create new names based on old ones. For example, to continue with the Float32 example, we could lowercase each column name and append a _32 suffix instead of relying on the automatic renaming.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@select(df, lowercase.($Real) .* \"_32\" = Float32($Real))","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"Just to reiterate, this expression amounts to something close to:","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"select(df, DataFrameMacros.stringargs(df, Real) .=> ByRow(Float32) .=> lowercase.(DataFrameMacros.stringargs(df, Real) .* \"_32\"))","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"The stringargs function handles the conversion from input object to column names and is almost equivalent to using DataFrames.names, except that Symbols, Strings, and collections thereof are passed through as-is.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"We can see the broadcasting aspect better by combining column specifiers of different length in one expression. Let's pretend for example, that we wanted to have columns that compute interactions of multiple numeric variables, such as age with survival status or passenger class:","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@select(df, :Age * $[:Survived, :Pclass])","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"As you can see, the :Age column was multiplied element-wise with each of the other two columns.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"This process works also with n-dimensional arrays, for example to multiply multiple columns in all possible combinations, we can use one row and one column vector:","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@select(df, $[:Survived, :Pclass] * $(permutedims([:Survived, :Pclass])))","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"The sink specifier can be an n-dimensional array as well, which is finally flattened into a sequence of columns going column-first.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@select(df, [\"a\" \"c\"; \"b\" \"d\"] = $[:Survived, :Pclass] * $(permutedims([:Survived, :Pclass])))","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"The left-hand side doesn't necessarily have to match the size of the right-hand side expression (remember we're broadcasting) but of course you just copy columns multiple times if you have more names than source columns.","category":"page"},{"location":"tutorial/","page":"Tutorial","title":"Tutorial","text":"@select(df, [\"a\", \"b\", \"c\"] = :Survived)","category":"page"}]
}
