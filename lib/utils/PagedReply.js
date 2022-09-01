const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// TODO: create api for disabling buttons

class PagedReply {
  // Options
  #pages;
  #messageContentSupplier;
  #buttons;
  #onButtonPressed;
  #ephemeral;
  #idleTimeout;

  // State
  #index;

  constructor() {
    this.#pages = 0;
    this.#messageContentSupplier = () => '';
    this.#buttons = [];
    this.#onButtonPressed = () => {};
    this.#ephemeral = false;
    this.#idleTimeout = 5_000;

    this.#index = 0;
  }

  setNumberOfPages(numberOfPages) {
    this.#pages = numberOfPages;
    return this;
  }

  messageContentSupplier(supplier) {
    this.#messageContentSupplier = (pageIndex) => {
      let content = supplier(pageIndex);
      if (typeof content === 'string') {
        content = { content };
      }
      return content;
    };
    return this;
  }

  setButtons(buttons) {
    this.#buttons = buttons;
    return this;
  }

  onButtonPressed(callback) {
    this.#onButtonPressed = callback;
    return this;
  }

  setEphemeral(ephemeral) {
    this.#ephemeral = ephemeral;
    return this;
  }

  setIdleTimeout(timeout) {
    this.#idleTimeout = timeout;
    return this;
  }

  #renderActionRow() {
    return [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('previous')
          .setLabel('Previous')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(this.#index <= 0),
        ...this.#buttons,
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(this.#index >= this.#pages - 1)
      ),
    ];
  }

  async reply(interaction) {
    // Make the initial reply
    const interactionResponse = await interaction.reply({
      ...this.#messageContentSupplier(this.#index),
      components: this.#renderActionRow(),
      ephemeral: this.#ephemeral,
    });

    // Start collecting button interactions
    const collector = interactionResponse.createMessageComponentCollector({
      filter: (interaction) => interaction.isButton(),
      idle: this.#idleTimeout,
    });

    collector.on('collect', async (interaction) => {
      try {
        collector.resetTimer(); // Reset idle timer when user interacts with response

        switch (interaction.customId) {
          case 'previous': {
            this.#index--;
            await interaction.update({
              ...this.#messageContentSupplier(this.#index),
              components: this.#renderActionRow(),
            });
            break;
          }
          case 'next': {
            this.#index++;
            await interaction.update({
              ...this.#messageContentSupplier(this.#index),
              components: this.#renderActionRow(),
            });
            break;
          }
          default:
            if (await this.#onButtonPressed(interaction, this.#index)) {
              collector.stop();
            }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        collector.stop();
        interaction.reply({
          content: 'An unexpected error occurred. Please try again.',
          ephemeral: true,
        });
      }
    });

    collector.on('end', () => {
      const [row] = this.#renderActionRow();
      row.components.forEach((buttonBuilder) =>
        buttonBuilder.setDisabled(true)
      );
      interactionResponse.interaction.editReply({ components: [row] });
    });
  }
}

module.exports = { PagedReply };
