package utils

type QuestionConfig struct {
	Column  string
	Answers map[string]int
}

var Questions = map[string]QuestionConfig{
	"Quel est ton style de musique préféré ?": {
		Column:  "q1",
		Answers: map[string]int{"Rap": 1, "Pop": 2, "Rock": 3, "Autre": 4},
	},
	"Quel est pour toi le voyage idéal ?": {
		Column:  "q2",
		Answers: map[string]int{"Voyage en famille": 1, "Voyage entre amis": 2, "Voyage en couple": 3, "Voyage solo": 4},
	},
	"Quelle est ta destination de rêve ?": {
		Column:  "q3",
		Answers: map[string]int{"Londres": 1, "Séoul": 2, "Marrakech": 3, "Rio de Janeiro": 4},
	},
	"Quel est ton genre de film/série préféré ?": {
		Column:  "q4",
		Answers: map[string]int{"Science-Fiction": 1, "Drame": 2, "Comédie": 3, "Action": 4},
	},
	"Tu passes le plus de temps sur :": {
		Column:  "q5",
		Answers: map[string]int{"Instagram": 1, "Snapchat": 2, "TikTok": 3, "Je ne suis pas vraiment sur les réseaux": 4},
	},
	"A l'école tu préfères :": {
		Column:  "q6",
		Answers: map[string]int{"Histoire-Géographie": 1, "Anglais": 2, "Sport": 3, "Français/Philosophie": 4},
	},
	"Au petit-déjeuner c'est plutôt :": {
		Column:  "q7",
		Answers: map[string]int{"Café/Thé": 1, "Jus de fruit": 2, "Eau": 3, "Lait/Chocolat chaud": 4},
	},
	"A Passy, le midi tu préfères être :": {
		Column:  "q8",
		Answers: map[string]int{"Dehors": 1, "Dans l'atrium": 2, "Dans la cour": 3, "En salle Verte/Bleue": 4},
	},
	"Avec 1.000.000 d'euros tu ferais plutôt :": {
		Column:  "q9",
		Answers: map[string]int{"Un don à un association": 1, "L'achat d'une maison dans le Sud": 2, "Un investissement boursier": 3, "Du shopping sur les Champs": 4},
	},
	"Comme super pouvoir, tu préfèrerais pouvoir :": {
		Column:  "q10",
		Answers: map[string]int{"Voler": 1, "Etre invisible": 2, "Lire dans les pensée": 3, "Remonter le temps": 4},
	},
	"Quelle est ta saison préférée :": {
		Column:  "q11",
		Answers: map[string]int{"Été": 1, "Automne": 2, "Hiver": 3, "Printemps": 4},
	},
	"Tu préfères lire :": {
		Column:  "q12",
		Answers: map[string]int{"Des romans": 1, "Des BD/mangas": 2, "Les journaux": 3, "Lire ?": 4},
	},
	"Tu préfères pratiquer quel sport :": {
		Column:  "q13",
		Answers: map[string]int{"Sport de raquette": 1, "Sport collectif": 2, "Sport de performance (athlétisme, natation...)": 3, "Sport de combat": 4},
	},
	"Quelle est ta soirée idéale ?": {
		Column:  "q14",
		Answers: map[string]int{"Soirée cinéma": 1, "Soirée entre amis": 2, "Soirée dodo": 3, "Soirée gaming": 4},
	},
	"Si tu pouvais dîner avec une personne historique ce serait :": {
		Column:  "q15",
		Answers: map[string]int{"Michael Jackson": 1, "Jules César": 2, "Pelé": 3, "Pythagore (même si t'as oublié son théorème)": 4},
	},
}
