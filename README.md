# RougeMinigame

Немного комментариев:

У многих функций нет шапок из джавадоков, т.к. мне в падлу было писать то, что никому здесь не нужно)

По некоторым причинам здесь относительно часто используется instanceof, возможно, в том числе и там, где существует и лучший подход.

То, что игрок после поражения не исчезает с карты, а лишь перестаёт отображаться
    (в коде тому причина наличие на него дополнительной ссылки, не очищаемой при поражении)
    - не баг, а фича. Мстительный дух завершит начатое.
    Нет, серьёзно, это фиксится в одну строчку, но я не хочу этого делать,
    по крайней мере пока после завершения игры не происходить чего-то особенного.
    Много в каких играх можно продолжить игру после победы и победить ещё не один раз.
    А после поражения? Вот то-то! Хехе.
