class Platzireactive {
    //*dependencias
    deps = new Map();

    constructor(options){
        this.origen = options.data(); // origen

        const self = this;

        //destino
        this.$data = new Proxy(this.origen,{
            //*GET dentro de este, recibimos de que objeto estamos intentando obtener una propiedad
            get(target, name, attr ){
                if (Reflect.has(target, name, attr)){
                    self.track(target, name, attr);
                    return Reflect.get(target, name, attr);
                }
                console.warn('La propiedad', name, 'no exixte');
                return '';
            },
            set(target, name, value){
                Reflect.set(target, name, value);
                self.trigger(name);
            }
        });
    }

    track (target,name){
        if (!this.deps.has(name)){
            const effect = () => {
                document.querySelectorAll(`*[p-text=${name}]`).forEach(el => {
                    this.pText(el, target, name);
                })
            };
            this.deps.set(name, effect); //aqui insertamos el efecto que creamos a las dependencias
        }
    }

    trigger (name){
        const effect = this.deps.get(name);
        effect();
    }
    
    mount(){
        document.querySelectorAll("*[p-text").forEach(el => {
            this.pText(el, this.$data, el.getAttribute("p-text"));
        });
        document.querySelectorAll("*[p-model]").forEach(el => {
            const name = el.getAttribute("p-model");
            this.pModel(el, this.$data, name);

            el.addEventListener("input", () =>{
                Reflect.set(this.$data, name, el.value);
            })
        });
        document.querySelectorAll("*[p-bind]").forEach(el =>{
            const [attr, name] = el.getAttribute("p-bind").match(/(\w+)/g);
            this.pBind(el, this.$data, name, attr);
        })
    }
    pText (el, target, name){
        el.innerText = Reflect.get(target,name);
    }
    pModel (el, target, name){
        el.value = Reflect.get(target,name);
    }
    pBind(el, target, attr) {
        const [attribute, key] = attr.split(':');
        el.setAttribute(attribute, Reflect.get(target, key));
    }
}

var Platzi = {
    createApp (options){
        return new Platzireactive (options);
    }
}