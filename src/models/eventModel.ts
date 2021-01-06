
class Bet365DataContainer {
    /// <summary>
    /// ANIMATION_ICON
    /// </summary>
    public AM: string;

    /// <summary>
    /// ANIMATION_SOUND
    /// </summary>
    public AS: string;

    /// <summary>
    /// AUDIO_AVAILABLE
    /// </summary>
    public AU: string;

    /// <summary>
    /// UNKNOWN (POSSIBLE BOOK_CLOSES / CLOSE_BETS_COUNT)
    /// </summary>
    public BC: string;

    /// <summary>
    /// UNKNOWN (example values: "1")
    /// </summary>
    public BF: string;

    /// <summary>
    /// UNKNOWN (example values: "1~JkJ+K2JhJxJeJuJRJbJrK9JoJ/K6JlK3GDJYJiJyK0HXJVJfJvJSJcJsJpK7GhJjJzK1JgJwJTJdJtJaJqK8JnK5")
    /// </summary>
    public BX: string;

    /// <summary>
    /// C3_ID
    /// </summary>
    public C3: string;

    /// <summary>
    /// UNKNOWN
    /// </summary>
    public CB: string;

    /// <summary>
    /// UNKNOWN (POSSIBLE CURRENT_PROGRESS / CURRENT_PERIOD / CLOSE_BETS_PRESENTATION_PULL_DISABLED)
    /// </summary>
    public CP: string;

    /// <summary>
    /// UNKNOWN (POSSIBLE DEFAULT_OPEN)
    /// </summary>
    public DO: string;

    /// <summary>
    /// UNKNOWN (POSSIBLE EVENT_TIME)
    /// </summary>
    public EA: string;

    /// <summary>
    /// UNKNOWN
    /// </summary>
    public ES: string;

    /// <summary>
    /// UNKNOWN (POSSIBLE EVENT_TYPE / END TIME)
    /// </summary>
    public ET: string;

    /// <summary>
    /// UNKNOWN (example values: "0")
    /// </summary>
    public FB: string;

    /// <summary>
    /// FILTERING
    /// </summary>
    public FF: string;

    /// <summary>
    /// DEFAULT_OPEN_HOMEPAGE
    /// </summary>
    public HO: string;

    /// <summary>
    /// SHOW_ON_HOMEPAGE
    /// </summary>
    public HP: string;

    /// <summary>
    /// IN_PLAY
    /// </summary>
    public IF: string;

    /// <summary>
    /// UNKNOWN (POSSIBLE IMAGE / INCLUDE_OVERVIEW_MARKET)
    /// </summary>
    public IM: string;

    /// <summary>
    /// UNKNOWN (example values: "")
    /// </summary>
    public LT: string;

    /// <summary>
    /// SECONDARY_UK_EVENT
    /// </summary>
    public MO: string;

    /// <summary>
    /// MATCH_POSTPONED
    /// </summary>
    public MP: string;

    /// <summary>
    /// MEDIA_ID
    /// </summary>
    public MS: string;

    /// <summary>
    /// NEUTRAL_VENUE_TEXT
    /// </summary>
    public NT: string;

    /// <summary>
    /// NON_MATCH_BASED
    /// </summary>
    public NM: string;

    /// <summary>
    /// NEUTRAL_VENUE
    /// </summary>
    public NV: string;

    /// <summary>
    /// UNKNOWN (POSSIBLE DEFAULT_OPEN_RIGHT / RACE_OFF)
    /// </summary>
    public RO: string;

    /// <summary>
    /// UNKNOWN (POSSIBLE PARTICIPANT_STATUS / POD_STACK)
    /// </summary>
    public PS: string;

    /// <summary>
    /// AUDIO_ID
    /// </summary>
    public SD: string;

    /// <summary>
    /// SECONDARY_EVENT
    /// </summary>
    public SE: string;

    /// <summary>
    /// STYLE
    /// </summary>
    public SY: string;

    /// <summary>
    /// START_TIME
    /// </summary>
    public SM: string;

    /// <summary>
    /// TEXT_3
    /// </summary>
    public T3: string;

    /// <summary>
    /// EMPTY_TOPIC_ID
    /// </summary>
    public TO: string;

    /// <summary>
    /// UNKNOWN
    /// </summary>
    public TV: string;

    /// <summary>
    /// CURRENT_INFO_V4
    /// </summary>
    public UC: string;

    /// <summary>
    /// VIDEO_AVAILABLE
    /// </summary>
    public VI: string;

    /// <summary>
    /// VIDEO_STREAM
    /// </summary>
    public VS: string;

    /// <summary>
    /// SHORT_POINTS
    /// </summary>
    public XP: string;


    public LivescoreContainerId: string;

    /// <summary>
    /// MarketGroup
    /// </summary>
    public MG_Element: MarketGroup[];

    public LastSentLivescore: string;

    public LastSentOdds: string;

    public CreationTime: Date;

    public MainPageEventElement: string;

    public Guid: string;
}

class MarketGroup {

    public ElementName: string = "MG";

    /// <summary>
    /// UNKNOWN
    /// </summary>

    public _4Q: string;
    /// <summary>
    /// BUTTON_SPLIT_INDEX
    /// </summary>

    public BI: string;
    /// <summary>
    /// BUTTON_BAR
    /// </summary>

    public BB: string;
    /// <summary>
    /// DEFAULT_OPEN
    /// </summary>

    public DO: string;
    /// <summary>
    /// FILTERING
    /// </summary>

    public FF: string;
    /// <summary>
    /// IBOX
    /// </summary>

    public IB: string;
    /// <summary>
    /// ID
    /// </summary>

    public ID: string;
    /// <summary>
    /// TOPIC_ID
    /// </summary>

    public IT: string;

    public FullPath: string;

    /// <summary>
    /// INRUNNING_INFO
    /// </summary>

    public IR: string;
    /// <summary>
    /// Name
    /// </summary>

    public NA: string;
    /// <summary>
    /// ORDER
    /// </summary>

    public OR: string;
    /// <summary>
    /// OTHERS_AVAILABLE
    /// </summary>

    public OT: string;
    /// <summary>
    /// SUSPENDED
    /// </summary>

    public SU: string;
    /// <summary>
    /// STYLE
    /// </summary>

    public SY: string;
    /// <summary>
    /// MARKET_GROUP_USER_PREFERENCE
    /// </summary>

    public PR: string;
    /// <summary>
    /// RESULTS_TEXT
    /// </summary>

    public RT: string;
    /// <summary>
    /// CURRENT_INFO_V4
    /// </summary>

    public UC: string;

    /// <summary>
    /// Market
    /// </summary>
    public MA_Element: Market[];
}

class Market {

    public ElementName: string = "MA";

    /// <summary>
    /// COLUMN_NUMBER
    /// </summary>

    public CN: string;
    /// <summary>
    /// UNKNOWN
    /// </summary>

    public DX: string;
    /// <summary>
    /// IBOX
    /// </summary>

    public IB: string;
    /// <summary>
    /// ID
    /// </summary>

    public ID: string;
    /// <summary>
    /// TOPIC_ID
    /// </summary>

    public IT: string;

    public FullPath: string;

    /// <summary>
    /// ORDER
    /// </summary>

    public OR: string;
    /// <summary>
    /// FILTERING
    /// </summary>

    public FF: string;
    /// <summary>
    /// NAME
    /// </summary>

    public NA: string;
    /// <summary>
    /// FIXTURE_PARENT_ID
    /// </summary>

    public FI: string;
    /// <summary>
    /// PARTICIPANT_STYLE
    /// </summary>

    public PY: string;
    /// <summary>
    /// UNKNOWN (POSSIBLE POD_TYPE / PRODUCT_TYPE)
    /// </summary>

    public PT: string;
    /// <summary>
    /// UNKNOWN
    /// </summary>

    public MA: string;
    /// <summary>
    /// STYLE
    /// </summary>

    public SY: string;
    /// <summary>
    /// UNKNOWN
    /// </summary>

    public RA: string;
    /// <summary>
    /// MARKET_TYPE
    /// </summary>

    public MT: string;
    /// <summary>
    /// PARTICIPANT_COUNT
    /// </summary>

    public PC: string;
    /// <summary>
    /// UNKNOWN
    /// </summary>

    public PE: string;
    /// <summary>
    /// UNKNOWN
    /// </summary>

    public PI: string;
    /// <summary>
    /// OTHERS_AVAILABLE
    /// </summary>

    public OT: string;
    /// <summary>
    /// SUSPENDED
    /// </summary>

    public SU: string;
    /// <summary>
    /// EMPTY_TOPIC_ID
    /// </summary>

    public TO: string;

    public PA_Element: OddParticipant[] = [];

    public CO_Element: OddColumn[] = [];

}

class OddColumn {

    public ElementName: string = "CO";

    /// <summary>
    /// COLUMNS_NUMBER
    /// </summary>

    public CN: string;
    /// <summary>
    /// ID
    /// </summary>

    public ID: string;
    /// <summary>
    /// TOPIC_ID
    /// </summary>

    public IT: string;

    public FullPath: string;

    /// <summary>
    /// NAME
    /// </summary>

    public NA: string;
    /// <summary>
    /// ORDER
    /// </summary>

    public OR: string;
    /// <summary>
    /// PARTICIPANT_STYLE
    /// </summary>

    public PY: string;
    /// <summary>
    /// STYLE
    /// </summary>

    public SY: string;

    public PA_Element: OddParticipant[] = [];
}

class OddParticipant {
    public Bet365BaseDataContainer: string;


    public ElementName: string = "PA";

    /// <summary>
    /// PLACE_365
    /// </summary>

    public _3P: string;

    /// <summary>
    /// WIN_365
    /// </summary>

    public _3W: string;

    /// <summary>
    /// ARCHIVE_FIXTURE_INFO
    /// </summary>

    public AF: string;
    /// <summary>
    /// UNKNOWN (POSSIBLE SOME ID, example values: "16079760","9089302")
    /// </summary>

    public DI: string;
    /// <summary>
    /// UNKNOWN (example values: "Tommy Fleetwood (Hole 2)","Robert Karlsson - (jamka 4)")
    /// </summary>

    public BS: string;
    /// <summary>
    /// UNKNOWN (POSSIBLE DIARY_NAME / DRAW_NUMBER)
    /// </summary>

    public DN: string;

    /// <summary>
    /// UNKNOWN (example values: "1")
    /// </summary>

    public FA: string;
    /// <summary>
    /// UNKNOWN
    /// </summary>

    public FI: string;
    /// <summary>
    /// UNKNOWN (POSSIBLE FORM_PULL / FINANCIALS_FEED_2)
    /// </summary>

    public FO: string;
    /// <summary>
    /// FILTERING
    /// </summary>

    public FF: string;
    /// <summary>
    /// HANDICAP
    /// </summary>

    public HA: string;
    /// <summary>
    /// HANDICAP_FORMATTED
    /// </summary>

    public HD: string;
    /// <summary>
    /// ID
    /// </summary>

    public ID: string;
    /// <summary>
    /// TOPIC_ID
    /// </summary>

    public IT: string;

    public FullPath: string;

    /// <summary>
    /// IMAGE_ID
    /// </summary>

    public IG: string;
    /// <summary>
    /// IMAGE
    /// </summary>

    public IM: string;
    /// <summary>
    /// NAME
    /// </summary>

    public NA: string;
    /// <summary>
    /// UNKNOWN (POSSIBLE CLOTH_NUMBER)
    /// </summary>

    public NC: string;
    /// <summary>
    /// ODDS
    /// </summary>

    public OD: string;
    /// <summary>
    /// ODDS_HISTORY
    /// </summary>

    public OH: string;
    /// <summary>
    /// ORDER
    /// </summary>

    public OR: string;
    /// <summary>
    /// UNKNOWN
    /// </summary>

    public RF: string;
    /// <summary>
    /// UNKNOWN (POSSIBLE RUNNER_STATUS / REGULAR_SINGLE)
    /// </summary>

    public RS: string;
    /// <summary>
    /// JOCKEY
    /// </summary>

    public JY: string;
    /// <summary>
    /// UNKNOWN (example values: "POINTS")
    /// </summary>

    public N2: string;
    /// <summary>
    /// TRAINER_NAME
    /// </summary>

    public TN: string;
    /// <summary>
    /// UNKNOWN (example values: "CF74712607_1_3")
    /// </summary>

    public TR: string;
    /// <summary>
    /// UNKNOWN (example values: "GD")
    /// </summary>

    public TO: string;
    /// <summary>
    /// SUSPENDED
    /// </summary>

    public SU: string;
    /// <summary>
    /// NO_OFFER
    /// </summary>

    public PX: string;

}
