using DataFrameMacros
using DataFrames
using Test

@testset "transform & select" begin
    df = DataFrame(a = 1:100, b = rand('a':'e', 100), c = randn(100))

    df2 = @transform(df, :a + 1)
    @test df2 == transform(df, :a => ByRow(x -> x + 1))
    df3 = @transform(df, :d = :a + 1)
    @test df3 == transform(df, :a => ByRow(x -> x + 1) => :d)
    df4 = @transform(df, :d = :a + 1, :e = :c * 2)
    @test df4 == transform(df,
        :a => ByRow(x -> x + 1) => :d,
        :c => ByRow(x -> x * 2) => :e
    )
    df5 = @transform(df, :d = :a + 1, :e = :c * 2, :f = :a * :c - (:c / :a))
    @test df5 == transform(df,
        :a => ByRow(x -> x + 1) => :d,
        :c => ByRow(x -> x * 2) => :e,
        [:a, :c] => ByRow((x, y) -> x * y - (y / x)) => :f
    )

    col1 = :a
    col2 = :c
    df6 = @transform(df, :d = $col1 + $col2 * :a)
    @test df6 == transform(df, [col1, col2, :a] => ByRow((x, y, z) -> x + y * z) => :d)

    s = "d"
    df7 = @transform(df, Symbol(s) = :a + 1)
    @test df7 == transform(df, :a => ByRow(x -> x + 1) => :d)

    df8 = @transform(df, AsTable = (x = "$(:a) $(:b)", y = :c * 2))

    @test df8 == transform(df,
        [:a, :b, :c] =>
            ByRow((a, b, c) -> (x = "$a $b", y = c * 2)) => AsTable
    )

    df9 = @transform(df, :a)
    @test df9 == transform(df, :a)

    df10 = @select(df, :a * 2)
    @test df10 == select(df, :a => ByRow(x -> x * 2))

    df11 = @select(df, :x = :a * 2)
    @test df11 == select(df, :a => ByRow(x -> x * 2) => :x)

    myfunc(x) = x + 2
    df12 = @transform(df, myfunc(:a))
    @test "a_myfunc" in names(df12)
    @test df12 == transform(df, :a => ByRow(myfunc))

    df13 = @transform(df, :x = @c sum(:a) .+ :c)
    @test df13 == transform(df, [:a, :c] => ((x, y) -> sum(x) .+ y) => :x)

    df14 = DataFrame(a = ['a', 'b', missing])
    df15 = @transform(df14, @m uppercase(:a))
    # @test df15 == transform(df14, :a => ByRow(passmissing(uppercase)))
end

@testset "combine" begin
    df = DataFrame(a = 1:100, b = rand('a':'e', 100), c = randn(100))

    df1 = @combine(df, sum(:a))
    @test df1 == combine(df, :a => sum)

    df2 = @combine(df, sum(:a) + 3)
    @test df2 == combine(df, :a => (x -> sum(x) + 3))

    df3 = @combine(df, :x = sum(:a) + 3)
    @test df3 == combine(df, :a => (x -> sum(x) + 3) => :x)

    df4 = @combine(df, :y = @r 3 * :a)
    @test df4 == combine(df, :a => ByRow(x -> 3 * x) => :y)
end

@testset "subset" begin
    df = DataFrame(a = [-1, 1, -2, 2, -3, 3], b = randn(6))
    df2 = @subset(df, abs(:a) < 2)
    @test df2 == subset(df, :a => ByRow(x -> abs(x) < 2))
end

@testset "groupby" begin
    df = DataFrame(a = [-1, 1, -2, 2, -3, 3], b = randn(6))
    gdf = @groupby(df, abs(:a))
    
    gdf2 = @groupby(df, :a = abs(:a))
    
    gdf3 = @groupby(df, :x = abs(:a))
end

@testset "sort" begin
    df = DataFrame(a = rand(1:10, 100), b = rand('a':'z', 100))
    df2 = @sort(df, :a)
    @test df2 == sort(df, :a)

    df3 = @sort(df, -:a)
    @test df3 == sort(df, :a, rev = true)

    df4 = @sort(df, -:a, :b)
    @test df4 == sort(df, [order(:a, rev = true), :b])

    df5 = @sort(df, :a; rev = true)
    @test df5 == sort(df, :a, rev = true)
end

@testset "escaping symbols" begin
    df = DataFrame(color = [:red, :green, :blue])
    df2 = @transform(df, :color == $:red)
    @test df2[:, 2] == transform(df, :color => ByRow(==(:red)))[:, 2]
end

@testset "mutating" begin
    df = DataFrame(a = 1:100, b = rand('a':'e', 100), c = randn(100))
    @transform!(df, :a = :a * 2)
    @sort!(df, :b)
    @subset!(df, :a > 20)
    @select!(df, :a, :c)
end

@testset "string and int column specification" begin
    df = DataFrame([Symbol("a column") => [1, 2, 3], :b => [4, 5, 6]])
    df2 = @transform(df, :c = $"a column" * $2)
    #"
    @test df2 == transform(df, ["a column", names(df)[2]] => ByRow(*) => :c)
end

module Mod1
    module Mod2
        export func2
        func2(x) = 3x
    end
    using .Mod2
    export Mod2

    export func
    func(x) = 2x
end

@testset "modules" begin
    
    using .Mod1

    df = DataFrame(a = [1, 2, 3])
    df2 = @transform(df, :b = Mod1.func(:a), :c = Mod1.Mod2.func2(:a))
    @test df2 == transform(df,
        :a => ByRow(x -> Mod1.func(x)) => :b,
        :a => ByRow(x -> Mod1.Mod2.func2(x)) => :c,
    )
end


@testset "simple formula" begin
    df = DataFrame(a = 1:10)
    df2 = @transform(df, :b = :a + :a)
    @test df2 == transform(df, :a => ByRow(x -> x + x) => :b)

    using .Mod1

    # check that column names are correct for simple function calls
    df3 = @transform(df, Mod1.func(:a), Mod1.Mod2.func2(:a))
    @test df3 == transform(df,
        :a => ByRow(Mod1.func),
        :a => ByRow(Mod1.Mod2.func2),
    )
end

@testset "getproperty dot syntax" begin
    df = DataFrame(a = [(;b = 1), (;b = 3)])
    df2 = @transform(df, :c = :a.b)
    @test df2 == transform(df, :a => ByRow(x -> x.b) => :c)
end


@testset "block syntax" begin
    df = DataFrame(a = 1:3, b = 'a':'c')
    df2 = @transform df begin
        :c = :a + 1
        :d = string(:b) ^ 2
    end
    @test df2 == @transform(df, :c = :a + 1, :d = string(:b) ^ 2)
end

@testset "table shortcut @t" begin
    df = DataFrame(a = 1:3, b = 4:6)
    df2 = @transform(df, @t begin
        x = :a + :b
        :y = x * 2
        :z = x + 4
    end)
    @test df2 == transform(df, [:a, :b] => ByRow((a, b) -> begin
        x = a + b
        vary = x * 2
        varz = x + 4
        (y = vary, z = varz)
    end) => AsTable)

    df3 = @transform(df, @t begin
        if iseven(:a)
            :z = :a
        else
            :z = :b
        end
    end)

    # tuple destructuring
    df4 = @transform(df, @t begin
        x = :a + :b
        :y, :z = x * 2, x + 4
    end)
    @test df4 == df2

    # tuple destructuring with non symbols mixed in
    df5 = @transform(df, @t begin
        x = :a + :b
        :y, qqq, :z = x * 2, "hello", x + 4
    end)
    @test df5 == df2 == df4
end
