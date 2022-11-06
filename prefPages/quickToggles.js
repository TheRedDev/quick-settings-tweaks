const ExtensionUtils = imports.misc.extensionUtils
const Me = ExtensionUtils.getCurrentExtension()
const { Adw, Gtk, GObject } = imports.gi

const {
    baseGTypeName,
    makeRow,
    makeSwitch
} = Me.imports.libs.prefItems

var quickTogglesPage = GObject.registerClass({
    GTypeName: baseGTypeName+'quickTogglesPage',
}, class quickTogglesPage extends Adw.PreferencesPage {
    filterListData = []
    filteredAppsGroup
    settings
    addFilteredAppButtonRow

    constructor(settings) {
        // group config
        super({
            name: 'quickToggles',
            title: 'Quick Toggles',
            iconName: 'org.gnome.Settings-symbolic'
        })

        const newTogglesGroup = new Adw.PreferencesGroup({
            title: 'Add more buttons',
            description: 'Turn on the buttons you want to add on Quick Settings'
        })
        makeSwitch({
            parent: newTogglesGroup,
            title: "DND Quick Toggle",
            subtitle: "Turn on to make the DND quick toggle visible on the Quick Settings panel",
            value: settings.get_boolean("add-dnd-quick-toggle-enabled"),
            bind: [settings, "add-dnd-quick-toggle-enabled"]
        })
        this.add(newTogglesGroup)

        // description / enable
        const descriptionGroup = new Adw.PreferencesGroup({
            title: 'Buttons to remove',
            description: 'Turn on the buttons you want to remove from Quick Settings'
        })
        makeRow({
            parent: descriptionGroup,
            title: "Remove chosen buttons from quick panel",
            subtitle: "Forked from https://github.com/qwreey75/gnome-quick-settings-button-remover"
        })
        makeRow({
            parent: descriptionGroup,
            title: "This feature is unstable sometime",
            subtitle: "When lock/unlock with gnome-screensaver, unexpected behavior occurs; button doesn't remove"
        })
        this.add(descriptionGroup)

        // general
        const removeGroup = new Adw.PreferencesGroup()
        this.add(removeGroup)

        let allButtons = settings.get_strv("list-buttons") || []
        let removedButtons = settings.get_strv("user-removed-buttons") || []
        let defaultInvisibleButtons = settings.get_strv("default-invisible-buttons") || []
        let buttonsLabel
        try {
            buttonsLabel = JSON.parse(settings.get_string("button-labels"))
        } catch {}
        buttonsLabel ||= {}
    
        for (let name of allButtons) {
            const row = new Adw.ActionRow({
                title: name + (
                    defaultInvisibleButtons.includes(name) ? " (invisible by system)" : ""
                ),
                subtitle: buttonsLabel[name] || null
            })
            removeGroup.add(row);
    
            const toggle = new Gtk.Switch({
                active: removedButtons.includes(name),
                valign: Gtk.Align.CENTER,
            });
    
            toggle.connect("notify::active",()=>{
                if (toggle.get_active()) {
                    removedButtons.push(name)
                } else {
                    while (true) {
                        let index = removedButtons.indexOf(name)
                        if (index != -1) {
                            removedButtons.splice(index,1)
                        } else break
                    }
                }
                settings.set_strv("user-removed-buttons",removedButtons)
            })
    
            row.add_suffix(toggle);
            row.activatable_widget = toggle;
        }
    }
})