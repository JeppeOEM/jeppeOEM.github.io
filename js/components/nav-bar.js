import { getSavedFont, saveFont } from "../font.js";

// <nav-bar>: the fixed top bar with page links and the font picker.
class NavBar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
    <div class="nav-wrapper">
      <nav class="nav">
        <div class="navbar-side"></div>
        <div class="navbar">
          <div>
            <a href="/" class="nav__link"><span class="bracket">[</span>HOME<span class="bracket">]</span></a>
            <a href="code.html" class="nav__link" data-link><span class="bracket">[</span>CODE<span class="bracket">]</span></a>
            <a href="/links.html" class="nav__link" data-link><span class="bracket">[</span>LINKS<span class="bracket">]</span></a>
          </div>
          <div>
            <span class="font-controls"><span class="bracket">[</span><label for="font-selector">FONT:</label><select id="font-selector">
                <option value="IBMVGA8">IBM VGA 8x16 ★</option>
                <option value="IBMBIOS2Y">IBM BIOS-2y ★</option>
                <optgroup label="AcPlus — VGA 8×16">
                  <option value="AcPlus_IBM_VGA_8x16">IBM VGA 8×16</option>
                  <option value="AcPlus_ToshibaSat_8x16">Toshiba Sat 8×16</option>
                  <option value="AcPlus_ToshibaTxL1_8x16">Toshiba TxL1 8×16</option>
                  <option value="AcPlus_ToshibaTxL2_8x16">Toshiba TxL2 8×16</option>
                </optgroup>
                <optgroup label="AcPlus — CGA 2y">
                  <option value="AcPlus_IBM_BIOS-2y">IBM BIOS 2y</option>
                  <option value="AcPlus_IBM_CGA-2y">IBM CGA 2y</option>
                  <option value="AcPlus_Amstrad_PC-2y">Amstrad PC 2y</option>
                  <option value="AcPlus_Tandy1K-II_200L-2y">Tandy 1K-II 2y</option>
                </optgroup>
                <optgroup label="Ac437 — VGA 8×16">
                  <option value="Ac437_ACM_VGA_8x16">ACM VGA 8×16</option>
                  <option value="Ac437_ATI_8x16">ATI 8×16</option>
                  <option value="Ac437_CL_EagleII_8x16">CL Eagle II 8×16</option>
                  <option value="Ac437_CL_EagleIII_8x16">CL Eagle III 8×16</option>
                  <option value="Ac437_IBM_VGA_8x16">IBM VGA 8×16</option>
                  <option value="Ac437_IGS_VGA_8x16">IGS VGA 8×16</option>
                  <option value="Ac437_MBytePC230_8x16">MByte PC230 8×16</option>
                  <option value="Ac437_NEC_APC3_8x16">NEC APC3 8×16</option>
                  <option value="Ac437_PhoenixEGA_8x16">Phoenix EGA 8×16</option>
                  <option value="Ac437_PhoenixVGA_8x16">Phoenix VGA 8×16</option>
                  <option value="Ac437_Sigma_RM_8x16">Sigma RM 8×16</option>
                  <option value="Ac437_SperryPC_8x16">Sperry PC 8×16</option>
                  <option value="Ac437_ToshibaSat_8x16">Toshiba Sat 8×16</option>
                  <option value="Ac437_ToshibaT300_8x16">Toshiba T300 8×16</option>
                  <option value="Ac437_ToshibaTxL1_8x16">Toshiba TxL1 8×16</option>
                  <option value="Ac437_ToshibaTxL2_8x16">Toshiba TxL2 8×16</option>
                  <option value="Ac437_TridentEarly_8x16">Trident Early 8×16</option>
                  <option value="Ac437_Trident_8x16">Trident 8×16</option>
                  <option value="Ac437_Verite_8x16">Verite 8×16</option>
                </optgroup>
                <optgroup label="Ac437 — CGA 2y">
                  <option value="Ac437_AMI_EGA_8x8-2y">AMI EGA 2y</option>
                  <option value="Ac437_ATI_8x8-2y">ATI 2y</option>
                  <option value="Ac437_Acer710_CGA-2y">Acer 710 CGA 2y</option>
                  <option value="Ac437_Acer_VGA_8x8-2y">Acer VGA 2y</option>
                  <option value="Ac437_Amstrad_PC-2y">Amstrad PC 2y</option>
                  <option value="Ac437_Apricot_200L-2y">Apricot 200L 2y</option>
                  <option value="Ac437_Copam_BIOS-2y">Copam BIOS 2y</option>
                  <option value="Ac437_DG_One-2y">DG One 2y</option>
                  <option value="Ac437_DTK_BIOS-2y">DTK BIOS 2y</option>
                  <option value="Ac437_EagleSpCGA_Alt1-2y">Eagle Sp CGA Alt1 2y</option>
                  <option value="Ac437_EagleSpCGA_Alt2-2y">Eagle Sp CGA Alt2 2y</option>
                  <option value="Ac437_EagleSpCGA_Alt3-2y">Eagle Sp CGA Alt3 2y</option>
                  <option value="Ac437_EpsonMGA-2y">Epson MGA 2y</option>
                  <option value="Ac437_EpsonMGA_Alt-2y">Epson MGA Alt 2y</option>
                  <option value="Ac437_EuroPC_CGA-2y">Euro PC CGA 2y</option>
                  <option value="Ac437_IBM_BIOS-2y">IBM BIOS 2y</option>
                  <option value="Ac437_IBM_CGA-2y">IBM CGA 2y</option>
                  <option value="Ac437_IBM_Conv-2y">IBM Conv 2y</option>
                  <option value="Ac437_ITT_Xtra-2y">ITT Xtra 2y</option>
                  <option value="Ac437_Kaypro2K_G-2y">Kaypro 2K G 2y</option>
                  <option value="Ac437_LE_Model_D_CGA-2y">LE Model D CGA 2y</option>
                  <option value="Ac437_MBytePC230_CGA-2y">MByte PC230 CGA 2y</option>
                  <option value="Ac437_Mindset-2y">Mindset 2y</option>
                  <option value="Ac437_NEC_APC3_8x8-2y">NEC APC3 2y</option>
                  <option value="Ac437_Nix8810_M35-2y">Nix 8810 M35 2y</option>
                  <option value="Ac437_Olivetti_M15-2y">Olivetti M15 2y</option>
                  <option value="Ac437_PhoenixEGA_8x8-2y">Phoenix EGA 2y</option>
                  <option value="Ac437_Phoenix_BIOS-2y">Phoenix BIOS 2y</option>
                  <option value="Ac437_SanyoMBC16-2y">Sanyo MBC16 2y</option>
                  <option value="Ac437_SanyoMBC55x-2y">Sanyo MBC55x 2y</option>
                  <option value="Ac437_SanyoMBC775-2y">Sanyo MBC775 2y</option>
                  <option value="Ac437_SeequaCm-2y">Seequa Cm 2y</option>
                  <option value="Ac437_SperryPC_CGA-2y">Sperry PC CGA 2y</option>
                  <option value="Ac437_Tandy1K-II_200L-2y">Tandy 1K-II 200L 2y</option>
                  <option value="Ac437_Tandy1K-I_200L-2y">Tandy 1K-I 200L 2y</option>
                  <option value="Ac437_ToshibaT300_8x8-2y">Toshiba T300 2y</option>
                  <option value="Ac437_VTech_BIOS-2y">VTech BIOS 2y</option>
                  <option value="Ac437_Verite_8x8-2y">Verite 2y</option>
                  <option value="Ac437_Wyse700a-2y">Wyse 700a 2y</option>
                  <option value="Ac437_Wyse700b-2y">Wyse 700b 2y</option>
                </optgroup></select><span class="bracket">]</span></span>
          </div>
        </div>
        <div class="navbar-side"></div>
      </nav>
    </div>
    `;

        const fontSelector = this.querySelector('#font-selector');
        fontSelector.value = getSavedFont();
        fontSelector.addEventListener('change', (e) => saveFont(e.target.value));
    }
}
customElements.define('nav-bar', NavBar);
