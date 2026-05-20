# Qwirkle

## Commands

### Start production server

```bash
node --run build
node --run start
```

### Start development server

```bash
node --run types -- --watch & node --run serve & node --run dev
```

### Run CI

```bash
node --run format
node --run types
node --run test
```
