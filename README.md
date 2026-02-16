# RoadMap:

# Je suis entrain de faire un rewrite du code en Go/Rust car plus perfommants et securiser, le code python va donc etre abandonne petit a petit. 
# Un rewrite du front avec React est prevu

### Meme si l'event est fini je continuerais d'ameliorer le code en ajoutant de la securite, simplifiant le code et faisant un vrai readme explicatif.
### Si vous voyez des ameliorations a faire ou avez des idees de fonctionnalites n'hesitz pas a ouvrir une issue ou meme faire une PR.
 

Security:
- [x] Add Cookies to login
- [x] Add cookies to guess func
- [ ] Add cookies in every "sensitive" funcs

Very important:
- [ ] Clean up the code
- [ ] Separate files for the main
- [ ] Create a real readme

Features:

Run Frontend (sans le back):

```bash
cd website && npm install
```

Puis
```bash
npm run dev
```

pour run le backend:

### Requirements 
Pandas
Uvicorn
FastApi
Openpyxl

### Build

Cloner le repo

```bash
git clone https://github.com/Lecloow/SaintValentin_Event/ && cd SaintValentin_Event/backend
```

Puis executer cette commande

```bash
uvicorn main:app --reload
```

Enfin, ouvrir un navigateur et acceder a http://127.0.0.1:8000/docs


Merci a @Maximaxx d'avoir DDOS le site plusieurs fois sans lui ce projet aurait pu etre possible 
